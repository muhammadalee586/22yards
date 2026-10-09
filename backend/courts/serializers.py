from rest_framework import serializers
from .models import Court, CourtImage

class CourtImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourtImage
        fields = '__all__'

class CourtSerializer(serializers.ModelSerializer):
    images = CourtImageSerializer(many=True, read_only=True)
    owner_name = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Court
        fields = '__all__'
        read_only_fields = ('average_rating', 'total_reviews', 'owner')

    def to_internal_value(self, data):
        import json
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'operating_days' in mutable_data and isinstance(mutable_data['operating_days'], str):
            try:
                mutable_data['operating_days'] = json.loads(mutable_data['operating_days'])
            except (ValueError, TypeError):
                mutable_data['operating_days'] = [d.strip() for d in mutable_data['operating_days'].split(',') if d.strip()]
        return super().to_internal_value(mutable_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)
