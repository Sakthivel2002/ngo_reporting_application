from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import NGOReport, ProcessingJob
from .serializers import ReportSerializer, JobStatusSerializer
import pandas as pd
from celery import shared_task
import io
from .models import models
from .tasks import process_csv_file


@api_view(['POST'])
def submit_report(request):
    serializer = ReportSerializer(data=request.data)
    if serializer.is_valid():
        report, created = NGOReport.objects.update_or_create(
            ngo_id=serializer.validated_data['ngo_id'],
            month=serializer.validated_data['month'],
            defaults=serializer.validated_data
        )
        return Response({
            'success': True,
            'created': created,
            'report_id': str(report.id)
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def upload_reports(request):
    file = request.FILES['file']
    job = ProcessingJob.objects.create()
    process_csv_file.delay(str(job.id), file.read())
    return Response({'job_id': str(job.id)})

@api_view(['GET'])
def job_status(request, job_id):
    try:
        job = ProcessingJob.objects.get(id=job_id)
        serializer = JobStatusSerializer(job)
        return Response(serializer.data)
    except ProcessingJob.DoesNotExist:
        return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def dashboard(request):
    from django.db.models import Sum 
    
    month = request.GET.get('month')
    if not month:
        return Response({'error': 'month parameter required'}, status=status.HTTP_400_BAD_REQUEST)
    
    queryset = NGOReport.objects.filter(month=month)
    
    totals = queryset.aggregate(
        total_ngos=models.Count('ngo_id', distinct=True),
        total_people_helped=models.Sum('people_helped'),
        total_events=models.Sum('events_conducted'),
        total_funds=models.Sum('funds_utilized')
    )
    
    return Response({
        'month': month,
        'total_ngos': totals['total_ngos'] or 0,
        'total_people_helped': totals['total_people_helped'] or 0,
        'total_events': totals['total_events'] or 0,
        'total_funds': float(totals['total_funds'] or 0),
    })


@shared_task(bind=True)
def process_csv_file(self, job_id, file_content):
    job = ProcessingJob.objects.get(id=job_id)
    job.status = 'processing'
    job.save()
    
    try:
        df = pd.read_csv(io.StringIO(file_content.decode('utf-8')))
        job.total_rows = len(df)
        job.save()
        
        success_count = 0
        errors = []
        
        for idx, row in df.iterrows():
            try:
                data = {
                    'ngo_id': str(row.get('ngo_id', '')),
                    'month': str(row.get('month', '')),
                    'people_helped': int(row.get('people_helped', 0)),
                    'events_conducted': int(row.get('events_conducted', 0)),
                    'funds_utilized': float(row.get('funds_utilized', 0))
                }
                
                serializer = ReportSerializer(data=data)
                if serializer.is_valid():
                    report, _ = NGOReport.objects.update_or_create(
                        ngo_id=data['ngo_id'],
                        month=data['month'],
                        defaults=data
                    )
                    success_count += 1
                else:
                    errors.append({'row': idx, 'errors': serializer.errors})
                    
            except Exception as e:
                errors.append({'row': idx, 'error': str(e)})
            
            job.processed_rows = idx + 1
            job.failed_rows = len(errors)
            job.save()
        
        job.status = 'completed'
        job.errors = errors
        job.save()
        
    except Exception as e:
        job.status = 'failed'
        job.errors = [{'error': str(e)}]
        job.save()


@api_view(['GET'])
def debug_job_errors(request, job_id):
    try:
        job = ProcessingJob.objects.get(id=job_id)
        return Response({
            'errors': job.errors,
            'status': job.status,
            'processed_rows': job.processed_rows
        })
    except ProcessingJob.DoesNotExist:
        return Response({'error': 'Job not found'})
