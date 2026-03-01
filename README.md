# Bangladesh Disease Surveillance

District-level disease surveillance system for Bangladesh with hospital reporting, outbreak alerting, and trend visualization.

## Architecture

```
bangladesh-disease-surveillance/
  src/           # Core modules
  tests/         # Unit and integration tests
  config/        # Configuration files
  docs/          # Documentation
```

## Modules

- **district_tracker**: Core district tracker functionality
- **hospital_reporter**: Core hospital reporter functionality
- **outbreak_alerter**: Core outbreak alerter functionality
- **trend_plotter**: Core trend plotter functionality
- **data_validator**: Core data validator functionality

## Quick Start

```bash
pip install -r requirements.txt
python -m bangladesh_disease_surveillance.main
```

## Testing

```bash
pytest tests/ -v
```

## License

MIT License - see LICENSE for details.
