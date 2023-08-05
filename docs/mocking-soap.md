# Mocking SOAP

Camouflage supports mocking for SOAP services.

### How to mock SOAP?

- Start by enabling soap protocol in the config file, provide the location of your ${SOAP_MOCKS} directory and optionally update the port.
- Also configure the WSDL schema containing the services you wish to mock and the path you want it to be available on.
```yaml
protocols:
  soap:
    enable: true
    mocks_dir: "./soap/mocks"
    port: 8100
    services:
      - wsdl: ./soap/countryservice.wsdl
        path: /countryinfo
```
- The folder structure for ${SOAP_MOCKS} follows the stucture of the WSDL schema, where you create a series of folders under ${SOAP_MOCKS} e.g. ${SOAP_MOCKS}/CountryInfoService/CountryInfoServiceSoap12/CountriesUsingCurrency.mock. This will allow you to POST to your mocked SOAP server using the url `http://localhost:8100/countryinfo`
```xml
<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
    <soap12:Body>
        <CountriesUsingCurrency xmlns="http://www.oorsprong.org/websamples.countryinfo">
            <sISOCurrencyCode>EU</sISOCurrencyCode>
        </CountriesUsingCurrency>
    </soap12:Body>
</soap12:Envelope>
```
- Camouflage uses `CountriesUsingCurrency.mock` to respond to all incoming messages. The contents of this file is not XML, but rather a JSON format containting a body property, which converted to a SOAP response by the mock server.
- The mock file, as you'd expect, supports handlebars! So you can generate random numbers, put conditional blocks etc.
- The format of mock file would be as follows:
```json
{
    "body": [
        {
            "sISOCode": "NL", 
            "sName": "The Netherlands"
        },
        {
            "sISOCode": "{{randomValue type='ALPHABETIC' uppercase=true length=2}}", 
            "sName": "{{randomValue type='ALPHABETIC' uppercase=true length=10}}"
        },
        {
            "sISOCode": "BE", 
            "sName": "Belgium"
        }
    ]
}
```
- It's also possible to delay responses by adding a delay. For example 10 seconds:
```json
{
    "delay": 10000,
    "body": "{{randomValue type='ALPHABETIC' uppercase=true length=2}}"
}
```

### Example request

**Request**

```bash
curl -X POST \
  'http://localhost:8100/countryinfo' \
  --header 'Accept: */*' \
  --header 'Content-Type: application/soap+xml; charset=utf-8' \
  --data-raw '<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <CountriesUsingCurrency xmlns="http://www.oorsprong.org/websamples.countryinfo">
      <sISOCurrencyCode>EU</sISOCurrencyCode>
    </CountriesUsingCurrency>
  </soap12:Body>
</soap12:Envelope>'
```

**Response**
```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://www.oorsprong.org/websamples.countryinfo">
    <soap:Body>
        <CountriesUsingCurrencyResponse>
            <sISOCode>NL</sISOCode>
            <sName>The Netherlands</sName>
        </CountriesUsingCurrencyResponse>
        <CountriesUsingCurrencyResponse>
            <sISOCode>TK</sISOCode>
            <sName>TCULNUKYLD</sName>
        </CountriesUsingCurrencyResponse>
        <CountriesUsingCurrencyResponse>
            <sISOCode>BE</sISOCode>
            <sName>Belgium</sName>
        </CountriesUsingCurrencyResponse>
    </soap:Body>
</soap:Envelope>
```