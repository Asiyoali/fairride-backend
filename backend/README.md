# FairRide Backend

FairRide – Smart Airport Taxi System backend built with Node.js, Express.js, MongoDB and JWT authentication.

## 1. Install

```bash
npm install
```

## 2. Create .env

Copy `.env.example` and rename it to `.env`.

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/fairride
JWT_SECRET=fairride_secret_key_change_this
JWT_EXPIRES_IN=7d
```

## 3. Run

```bash
npm run dev
```

or

```bash
npm start
```

## 4. Main API

### Auth

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
```

### Driver

```txt
GET /api/drivers
GET /api/drivers/me
PUT /api/drivers/status
GET /api/drivers/my-trips
```

### Rides

```txt
POST /api/rides/request
GET  /api/rides/my-rides
GET  /api/rides/current
PUT  /api/rides/accept/:id
PUT  /api/rides/complete/:id
PUT  /api/rides/cancel/:id
```

### Ratings

```txt
POST /api/ratings
GET  /api/ratings/driver/:driverId
```

### Admin

```txt
GET    /api/admin/dashboard
GET    /api/admin/rides
GET    /api/admin/reports
PUT    /api/admin/drivers/approve/:id
DELETE /api/admin/drivers/:id
PUT    /api/admin/reset-trips
```

## 5. User Roles

```txt
admin
driver
passenger
```

## 6. Driver Assignment Logic

The system assigns the available and approved driver with the fewest `totalTripsToday`.
If multiple drivers have the same number, it chooses the one who was assigned earlier or created earlier.
