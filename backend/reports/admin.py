from django.contrib import admin
from .models import NGOReport, ProcessingJob

@admin.register(NGOReport)
class NGOReportAdmin(admin.ModelAdmin):
    list_display = ['ngo_id', 'month', 'people_helped', 'events_conducted', 'funds_utilized']
    list_filter = ['month']

@admin.register(ProcessingJob)
class ProcessingJobAdmin(admin.ModelAdmin):
    list_display = ['id', 'status', 'total_rows', 'processed_rows', 'failed_rows', 'created_at']
    list_filter = ['status', 'created_at']
