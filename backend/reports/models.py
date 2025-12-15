from django.db import models
import uuid

class NGOReport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ngo_id = models.CharField(max_length=100)
    month = models.CharField(max_length=7)  
    people_helped = models.IntegerField()
    events_conducted = models.IntegerField()
    funds_utilized = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['ngo_id', 'month'] 
    
    def __str__(self):
        return f"{self.ngo_id} - {self.month}"

class ProcessingJob(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    status = models.CharField(max_length=20, default='pending')  
    total_rows = models.IntegerField(null=True)
    processed_rows = models.IntegerField(default=0)
    failed_rows = models.IntegerField(default=0)
    errors = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
