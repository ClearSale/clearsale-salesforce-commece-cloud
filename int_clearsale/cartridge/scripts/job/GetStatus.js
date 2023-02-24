'use strict';

var OrderMgr = require('dw/order/OrderMgr');
var Status = require('dw/system/Status');
var Transaction = require('dw/system/Transaction');
var ClearSaleService = require('~/int_clearsale/cartridge/scripts/service/ClearSaleService');
var ServiceHelper = require('~/int_clearsale/cartridge/scripts/util/ServiceHelper');

/**
 * Get the order status from clearsale web service
 * @returns {*}
 */
function execute() {
    var statusOK = new Status(Status.OK);
    var orders = OrderMgr.searchOrders('custom.clearsale_Status={0} OR custom.clearsale_Status={1}', 'orderNo asc', 'NVO','AMA');

    var result = ClearSaleService.call({ operation: 'Login' });
    var token = result.object.token;

	while(orders.hasNext()) {
		var order = orders.next();
    		result = ClearSaleService.call({ operation: 'Get', token: token, order: order });

    		Transaction.wrap(function () {
                order.custom.clearsale_Status = result.object.status;
                // add the description for the ClearSale status
				order.custom.clearsale_StatusDescription = ServiceHelper.getStatusDescription(result.object.status);
            });
            
            // process the status and set appropriate status of the order
			ServiceHelper.processClearSaleStatus(order.custom.clearsale_Status, order);
    }

    return statusOK;
}


module.exports.execute = execute;
