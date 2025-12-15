from rest_framework import serializers
from .models import NGOReport, ProcessingJob
import pandas as pd
from decimal import Decimal

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = NGOReport
        fields = ['ngo_id', 'month', 'people_helped', 'events_conducted', 'funds_utilized']
    
    def validate(self, data):
        if not data['month'] or len(data['month']) < 7:
            raise serializers.ValidationError("Month must be YYYY-MM format")
        
        if any(x < 0 for x in [data.get('people_helped', 0), data.get('events_conducted', 0), data.get('funds_utilized', 0)]):
            raise serializers.ValidationError("Values cannot be negative")
        
        if not data['ngo_id'].strip():
            raise serializers.ValidationError("NGO ID is required")
            
        return data


class JobStatusSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    
    class Meta:
        model = ProcessingJob
        fields = ['id', 'status', 'total_rows', 'processed_rows', 'failed_rows', 'errors', 'progress']
    
    def get_progress(self, obj):
        if obj.total_rows and obj.total_rows > 0:
            return round((obj.processed_rows / obj.total_rows) * 100, 1)
        return 0
