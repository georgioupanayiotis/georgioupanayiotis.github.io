var wdc_access_token
function init() {
  // reset page
  var url = window.location.href;
  console.log('url', url)

  if (url.indexOf('https://georgioupanayiotis.github.io/zopim-wdc.html') !== -1) {
    if (url.indexOf('access_token=') !== -1) {
      var access_token = readUrlParam(url, 'access_token');
      wdc_access_token = access_token
    }
    else if(url.indexOf('code')!== -1){
      var split_url = new URL(url);
      var code = split_url.searchParams.get("code");
      var test = getAccessToken(code)
    }

    if (url.indexOf('error=') !== -1) {
      var error_desc = readUrlParam(url, 'error_description');
      var msg = 'Authorization error: ' + error_desc;
      showError(msg);
    }
  }
}

function getTicket(table, doneCallback) {
  var access_token = tableau.connectionData;
  makeRequest(table, access_token, doneCallback);
}

function makeRequest(table, token, doneCallback) {
  console.log('Token', token)
  $.ajax({
    type: 'GET',
    url: 'https://web-api.bdswiss.com/api/external/zopim?token=' + token,
    success: function(data) {
      table.appendRows(data)
      console.log(data)
      doneCallback()
    },
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoic2VydmljZSIsImlkIjoiem9waW0ifQ.Tn5nQGDSWPUW-j-4slE9sxn3WMm_knggjJEpyRtsqlc'
    },
    error: function(error) {
      console.log('Error', error)
      doneCallback()
    }
  })
}

function showError(msg) {
  console.log(msg)
}

function readUrlParam(url, param) {
  param += '=';
  if (url.indexOf(param) !== -1) {
    var start = url.indexOf(param) + param.length;
    var value = url.substr(start);
    if (value.indexOf('&') !== -1) {
      var end = value.indexOf('&');
      value = value.substring(0, end);
    }
      return value;
    } else {
      return false;
    }
}

function startAuthFlow() {
  var endpoint = 'https://www.zopim.com/oauth2/authorizations/new';
  var url_params = '?' +
  'response_type=token' + '&' +
  'redirect_uri=https%3A%2F%2Fgeorgioupanayiotis.github.io%2Fzopim-wdc.html' + '&' +
  'client_id=GyZtMNKrhn9zE82OJM1GA4zLOuHtAlNSz9eplhDCFupacJYxPl' + '&' +
  'scope=read%20write' + '&' +
  'subdomain=bdswiss'
  console.log(endpoint + url_params)
  window.location = endpoint + url_params;
}

function getAccessToken(code){
  console.log('Code', code)

  $.ajax({
    type: 'POST',
    url: 'https://www.zopim.com/oauth2/token?grant_type=authorization_code&code='+code+'&client_id=GyZtMNKrhn9zE82OJM1GA4zLOuHtAlNSz9eplhDCFupacJYxPl&client_secret=pFTmd0N5Mb7F5GcGBdsXJvY0siyE18Ff34OfzzqooRIFWqhNAc0vzXIS5sOAesCK&redirect_uri=https%3A%2F%2Fgeorgioupanayiotis.github.io%2Fzopim-wdc.html&scope=read%20write',
    success: function(data) {
      console.log('Data', data)
    },
    error: function(error) {
      console.log(error)
    }
  });
}

window.addEventListener('load', init, false);


function getData(table, doneCallback) {
  getTicket(table, doneCallback)
}

  (function () {
    var myConnector = tableau.makeConnector()

    myConnector.getSchema = function (schemaCallback) {
      var cols = [
        {id: 'id', alias: 'ID', dataType: tableau.dataTypeEnum.int},
        {id: 'visitorName', alias: 'Name', dataType: tableau.dataTypeEnum.string},
        {id: 'visitorEmail', alias: 'Email', dataType: tableau.dataTypeEnum.string},
        {id: 'type', alias: 'Type', dataType: tableau.dataTypeEnum.string},
        {id: 'startedBy', alias: 'Started by', dataType: tableau.dataTypeEnum.string},
        {id: 'sessionCity', alias: 'City', dataType: tableau.dataTypeEnum.string},
        {id: 'sessionEndDate', alias: 'End date', dataType: tableau.dataTypeEnum.string},
        {id: 'sessionIp', alias: 'IP', dataType: tableau.dataTypeEnum.string},
        {id: 'sessionRegion', alias: 'Region', dataType: tableau.dataTypeEnum.string},
        {id: 'sessionStartDate', alias: 'Start date', dataType: tableau.dataTypeEnum.string},
        {id: 'sessionPlatform', alias: 'Platform', dataType: tableau.dataTypeEnum.string},
        {id: 'sessionCountryCode', alias: 'Country Code', dataType: tableau.dataTypeEnum.string},
        {id: 'sessionCountryName', alias: 'Country', dataType: tableau.dataTypeEnum.string},
        {id: 'sessionBrowser', alias: 'Browser', dataType: tableau.dataTypeEnum.string},
        {id: 'duration', alias: 'Duration', dataType: tableau.dataTypeEnum.datetime},
        {id: 'departmentId', alias: 'Department ID', dataType: tableau.dataTypeEnum.int},
        {id: 'department', alias: 'Department', dataType: tableau.dataTypeEnum.string},
        {id: 'responseTimeMax', alias: 'Response Max', dataType: tableau.dataTypeEnum.string},
        {id: 'responseTimeAvg', alias: 'Res. Avg', dataType: tableau.dataTypeEnum.float},
        {id: 'responseTimeFirst', alias: 'Res. First', dataType: tableau.dataTypeEnum.float},
        {id: 'agentNames', alias: 'Agent', dataType: tableau.dataTypeEnum.string},
        {id: 'rating', alias: 'Rating', dataType: tableau.dataTypeEnum.string},
      ]

      var tableInfo = {
        id: 'bdSwissZopimDetails',
        alias: 'BDSwiss Zopim Details',
        columns: cols
      }

      schemaCallback([tableInfo])
    }

    myConnector.getData = function(table, doneCallback) {
      getData(table, doneCallback)
    }

    tableau.registerConnector(myConnector)

    $(document).ready(function () {
      $('#authButton').click(function () {
        startAuthFlow()
      })
      $('#submitButton').click(function () {
        tableau.connectionName = 'BDSwiss Zendesk Data'
        tableau.connectionData = wdc_access_token
        tableau.submit()
      })
    })
  })()
