from django.db import models
from account.models import User
# Create your models here.

class Message(models.Model):
    content = models.TextField()
    sent_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, related_name='messages', blank=True, on_delete=models.SET_NULL, null=True)

    class Meta:
        ordering = ('created_at',)

    def __str__(self) -> str:
        return self.content


class Room(models.Model):
    CHOICES = (('waiting','waiting'), ('active','active'), ('closed','closed'))

    uuid = models.CharField(max_length=255)
    room_name = models.CharField(max_length=255)
    agent = models.ForeignKey(User, null=True, blank=True, related_name='rooms', on_delete=models.SET_NULL)
    messages = models.ManyToManyField(Message, blank=True, related_name='room_messages')
    url = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, related_name='rooms_created', null=True, on_delete=models.SET_NULL)
    status =models.CharField(max_length=20, choices=CHOICES, default='waiting')

    class Meta:
        ordering = ('created_at',)

    def __str__(self) -> str:
        return f'room :{self.room_name} - {self.agent} - {self.status}'
