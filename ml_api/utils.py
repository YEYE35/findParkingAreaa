from .schemas import UserFeatures, ParkingFeatures
from .model_loader import get_model_bundle

def user_parking_to_vector(user: UserFeatures, parking: ParkingFeatures):
    bundle = get_model_bundle()
    parking_id_to_code = bundle.get('parking_id_to_code', {})
    parking_code = parking_id_to_code.get(parking.id, -1)

    return [parking_code]
