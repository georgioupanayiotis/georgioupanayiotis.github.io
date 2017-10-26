var wdc_access_token
function init() {
  // reset page
  var url = window.location.href;
  if (url.indexOf('https://georgioupanayiotis.github.io/zopim-wdc.html') !== -1) {
    if (url.indexOf('access_token=') !== -1) {
      var access_token = readUrlParam(url, 'access_token');
      wdc_access_token = access_token
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
  makeRequest(table, access_token, doneCallback, 'https://www.zopim.com/api/v2/chats.json?sort_by=timestamp');
}

function makeRequest(table, token, doneCallback, next_url) {
  $.ajax({
    type: 'GET',
    url: 'https://web-api.bdswiss.com/api/external/zopim?token=' + token + '&url=' + next_url,
    success: function(data) {
      data = JSON.parse(data)
      if (data.next_url) {
        table.appendRows(data.tableData)
        makeRequest(table, token, doneCallback, data.next_url)
      } else {
        table.appendRows(data.tableData)
        doneCallback()
      }
    },
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoic2VydmljZSIsImlkIjoiem9waW0ifQ.MOoZ0H9TeQPX5ay_EvLzqb2CFe1ctxltHjDolFmajcs'
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
  window.location = endpoint + url_params;
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
        tableau.connectionName = 'BDSwiss Zopim Data'
        tableau.connectionData = wdc_access_token
        tableau.submit()
      })
    })
  })()
