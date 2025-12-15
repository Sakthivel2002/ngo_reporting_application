from celery import shared_task
from .models import NGOReport, ProcessingJob
from django.db import transaction
import pandas as pd
import io

@shared_task(bind=True)
def process_csv_file(self, job_id, file_content):
    job = ProcessingJob.objects.get(id=job_id)
    job.status = 'processing'
    job.save()
    
    try:
        csv_content = file_content.decode('utf-8')
        df = pd.read_csv(io.StringIO(csv_content))
        job.total_rows = len(df)
        job.save()
        
        success_count = 0
        errors = []
        
        for idx, row in df.iterrows():
            try:
                ngo_id = str(row.get('ngo_id', '')).strip()
                month = str(row.get('month', '')).strip()
                
                if not ngo_id or not month:
                    errors.append({'row': idx, 'error': 'Missing NGO ID or month'})
                    continue
                
                people_helped = int(float(row.get('people_helped', 0)))
                events_conducted = int(float(row.get('events_conducted', 0)))
                funds_utilized = float(row.get('funds_utilized', 0))
                
                if people_helped < 0 or events_conducted < 0 or funds_utilized < 0:
                    errors.append({'row': idx, 'error': 'Negative values not allowed'})
                    continue
                
                if len(month) != 7 or not month[4] == '-':
                    errors.append({'row': idx, 'error': f'Invalid month format: {month}'})
                    continue
                
                report, created = NGOReport.objects.update_or_create(
                    ngo_id=ngo_id,
                    month=month,
                    defaults={
                        'people_helped': people_helped,
                        'events_conducted': events_conducted,
                        'funds_utilized': funds_utilized
                    }
                )
                success_count += 1
                
            except Exception as e:
                errors.append({'row': idx, 'error': f'Processing error: {str(e)}'})
                continue
            
            job.processed_rows = idx + 1
            job.failed_rows = len(errors)
            job.save()
        
        job.status = 'completed'
        job.errors = errors if errors else []
        job.save()
        
    except Exception as e:
        job.status = 'failed'
        job.errors = [{'error': f'CSV parse error: {str(e)}'}]
        job.save()
