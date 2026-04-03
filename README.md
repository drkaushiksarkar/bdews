# bdews -- Bangladesh Disease Early Warning System

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

Operational disease surveillance and alerting platform for the Bangladesh national health program. Processes real-time epidemiological signals from district health facilities, generates automated alerts when outbreak thresholds are breached, and provides situational awareness dashboards for health program managers.

## Architecture

```
District Health Facilities --> Data Ingestion API --> PostgreSQL
                                                        |
                                    +-------------------+-------------------+
                                    |                   |                   |
                              Threshold Engine    Trend Analysis     Spatial Clustering
                                    |                   |                   |
                                    +-------------------+-------------------+
                                                        |
                                                  Alert Dispatcher
                                                        |
                                    +-------------------+-------------------+
                                    |                   |                   |
                              SMS Gateway        Dashboard API        Weekly Reports
```

## Core Components

| Component | Purpose |
|:----------|:--------|
| Data Ingestion | Receives facility-level case reports via REST API with validation |
| Threshold Engine | Configurable alert thresholds per disease, district, and season |
| Trend Analysis | Detects anomalous increases using moving average deviation |
| Spatial Clustering | Identifies geographic hotspots using scan statistics |
| Alert Dispatcher | Multi-channel notifications (SMS, email, dashboard) |
| Dashboard API | RESTful endpoints serving district and national views |

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Database**: PostgreSQL with time-series optimized schemas
- **API**: Express.js with OpenAPI specification
- **Alerting**: Configurable threshold rules with seasonal adjustment
- **Deployment**: Docker containers with health checks

## Diseases Monitored

Dengue, malaria, kala-azar, chikungunya, acute watery diarrhea, typhoid, and 12 additional notifiable conditions as defined by the Bangladesh DGHS.

## License

Proprietary
