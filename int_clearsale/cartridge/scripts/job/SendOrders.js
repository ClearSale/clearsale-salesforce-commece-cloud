'use strict';

var OrderMgr = require('dw/order/OrderMgr');
var Order= require('dw/order/Order');
var Status = require('dw/system/Status');
var Transaction = require('dw/system/Transaction');
var ClearSaleService = require('~/int_clearsale/cartridge/scripts/service/ClearSaleService');
var ServiceHelper = require('~/int_clearsale/cartridge/scripts/util/ServiceHelper');

/**
 * Sends the orders to the clearsale web service
 * @returns {*}
 */
function execute() {

    var statusOK = new Status(Status.OK);
	var query = 'status = {0} OR status = {1} AND custom.clearsale_Status = {2}';
    var orders = OrderMgr.searchOrders(query, 'orderNo asc', Order.ORDER_STATUS_NEW, Order.ORDER_STATUS_OPEN, null);

    var result = ClearSaleService.call({ operation: 'Login' });
    var token = result.object.token;
    var orderAlreadyExists = false;

	while(orders.hasNext()) {
		var order = orders.next();
    		result = ClearSaleService.call({ operation: 'Send', token: token, order: order });
    		
    		if (result.error && result.error == 400 && result.errorMessage.indexOf('Order already exists') > -1) {    			    			
    			orderAlreadyExists = true;  
    		} 
    		
    		Transaction.wrap(function () {	 
	    		if (orderAlreadyExists) {
					order.custom.clearsale_Status = 'NVO';
					return statusOK;
	    		} else {
	    			order.custom.clearsale_Status = result.object.status;
					order.custom.clearsale_TransactionID = result.object.transactionID;
				}
				// add the description for the ClearSale status
				order.custom.clearsale_StatusDescription = ServiceHelper.getStatusDescription(result.object.status);
			});
			
			// process the status and set appropriate status of the order
			ServiceHelper.processClearSaleStatus(order.custom.clearsale_Status, order);
    }

    return statusOK;
}

module.exports.execute = execute;
