'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var ServiceHelper = require('~/int_clearsale/cartridge/scripts/util/ServiceHelper.ds');

/**
 * Local Service Registry for the web service
 */
module.exports =  LocalServiceRegistry.createService('int_clearsale.http.orders.ClearSale.SiteGenesis', {

    createRequest: function(service, params) {
        return ServiceHelper.createRequest(service, params);
    },

    parseResponse: function(service, response) {
        return ServiceHelper.responseParser(service, response);
    },
    
     filterLogMessage: function(msg) {
         //  No need to filter logs.  No sensitive information.
            return msg;
    }
});