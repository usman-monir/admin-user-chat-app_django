from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import Room

# Create your views here.
@require_POST
def create_room(request, uuid):
    client = request.POST.get('name', '')
    url = request.POST.get('url', '')

    Room.objects.create( uuid=uuid, client=client, url=url)
    return JsonResponse({'message': 'Room created successfully'})
