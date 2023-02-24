'use strict';

var Site = require('dw/system/Site');
var Transaction = require('dw/system/Transaction');

/**
 * Create and return a request object based on the service and parameters
 * @param {HttpService} service - the HttpService reference
 * @param {Object} params - request parameters
 * @returns {*}
 */
exports.createRequest = function(service, params) {

    var request = null;
    var operation = params.operation;

    service.addHeader('Content-Type', 'application/json');
    service.setRequestMethod('POST');
    service.setURL(service.getConfiguration().getCredential().getURL());

    switch(operation.toLowerCase()) {

        case 'login':
            service.setURL(service.getURL() + '/api/auth/login');
            request = getLoginRequest(service);
            break;
        case 'send':
            service.setURL(service.getURL() + '/api/order/send');
            request = getSendRequest(params);
            break;
        case 'get':
            service.setURL(service.getURL() + '/api/order/get');
            request = getGetRequest(params);
            break;
        default:
            new Error('Cannot find the operation ' + operation);
    }

    return request;
};

/**
 * Create and return result object after parsing the response
 * @param {HttpService} service - the HttpService reference
 * @param {Object} response - response object
 * @returns {*}
 */
exports.responseParser = function(service, response) {

    var result = null;
    var responseObject = JSON.parse(response.text);

    if(service.getURL().indexOf('login') > -1) {
        result =  {
            token: responseObject.Token.Value,
            tokenExpiration: responseObject.Token.ExpirationDate
        };
    } else if (service.getURL().indexOf('send') > -1) {
        result =  {
            status: responseObject.Orders[0].Status,
            transactionID: responseObject.TransactionID
        };
    }else if (service.getURL().indexOf('get') > -1) {
        result =  {
            status: responseObject.Orders[0].Status
        };
    }

    return result;
};

/**
 * Helper method to get description for a ClearSale status
 * @param {String} status - ClearSale status
 * @returns {String} - description
 */
exports.getStatusDescription = function(status) {
	var Resource = require('dw/web/Resource');
	var statusList = {
        APA: Resource.msg('automatic_approval', 'statusdescription', null),
        APM: Resource.msg('manual_approval', 'statusdescription', null),
        RPM: Resource.msg('denied_without_prejudice', 'statusdescription', null),
        AMA: Resource.msg('manual_analysis', 'statusdescription', null),
        ERR: Resource.msg('error', 'statusdescription', null),
        NVO: Resource.msg('new_order', 'statusdescription', null),
        SUS: Resource.msg('fraud_suspicion', 'statusdescription', null),
        CAN: Resource.msg('customer_asked_cancellation', 'statusdescription', null),
        FRD: Resource.msg('confirmed_fraud', 'statusdescription', null),
        RPA: Resource.msg('automatically_denied', 'statusdescription', null),
        RPP: Resource.msg('denied_by_policy', 'statusdescription', null)
	}
	
	
	
	return statusList[status];
}

/**
 * Helper method to get preference value
 * @param {String} preferenceId - preference id
 * @returns {*}
 */
function getPreference(preferenceId) {
    return Site.getCurrent().getCustomPreferenceValue(preferenceId);
}

/**
 * Helper method to get request object for login operation
 * @param service
 * @returns {String} - JSON string
 */
function getLoginRequest(service) {

    var credentials = service.getConfiguration().getCredential();

    var loginRequest = {
        Login: {
            Apikey: getPreference('clearsale_ApiKey'),
            ClientID: credentials.getUser(),
            ClientSecret: credentials.getPassword()
        }
    };

    return JSON.stringify(loginRequest);
}

/**
 * Helper method to get the request for send operation
 * @param params
 * @returns {String} - JSON string
 */
function getSendRequest(params) {

	var order = params.order;
	var paymentInstrument = order.getPaymentInstruments('CREDIT_CARD')[0];
	var billingAddress = order.getBillingAddress();
	var shippingAddress = order.getDefaultShipment().getShippingAddress();
	var analysisLocation = getPreference('clearsale_AnalysisLocation').value;

    var sendRequest = {
	    ApiKey: getPreference('clearsale_ApiKey'),
	    LoginToken: params.token,
	    Orders: [
		    {
			    ID: order.orderNo,
			    Date: order.getCreationDate().toISOString(),
			    Email: order.getCustomerEmail(),
			    TotalItems: order.getProductLineItems().size() ,
			    TotalOrder: order.getTotalGrossPrice().value,
			    TotalShipping: order.getShippingTotalGrossPrice().value,
			    IP: order.getRemoteHost(),
			    Currency: order.getCurrencyCode(),
			    Payments :
			    [
				    {
					    Date: paymentInstrument.getPaymentTransaction().getCreationDate().toISOString(),
					    Type: 1,
					     CardEndNumber: paymentInstrument.getCreditCardNumberLastDigits(),
					    CardHolderName: paymentInstrument.getCreditCardHolder(),
					    CardExpirationDate: paymentInstrument.getCreditCardExpirationMonth() + '/' + paymentInstrument.getCreditCardExpirationYear(),
					    Amount: paymentInstrument.getPaymentTransaction().getAmount().value,
					    PaymentTypeID: 1,
					    CardType: getCardType(paymentInstrument.getCreditCardType())
				    }
			    ],
			    BillingData :
			    {
				    ID: 45,
				    Type: 1,
				    BirthDate: '1990-01-01T00:00:00',
				    Gender: 'M',
				  //LegalDocument: ,CPF number for Brazil, DNI number for argentina
				    Name: order.getBillingAddress().getFullName(),
				    Email: order.getCustomerEmail(),
				    Address :
				    {
					    Street: billingAddress.getAddress1(),
					    City: billingAddress.getCity(),
					    State: billingAddress.getStateCode(),
					    Comp: billingAddress.getCompanyName(),
					    ZipCode: billingAddress.getPostalCode(),
					    Country: billingAddress.getCountryCode().displayValue,
					    Number: ''
				    },
				    Phones: [
					    {
						    Type: 0,
						    CountryCode: 1,
						    AreaCode: 0,
						    Number: order.getBillingAddress().getPhone()
					    }
				    ]
			    },
			    ShippingData :
			    {
				    ID: 45,
				    Type: 1,
				    Name: order.getDefaultShipment().getShippingAddress().getFullName(),
				    Gender: 'M',
				     //LegalDocument: CPF number for Brazil, DNI number for argentina
				    Email: order.getCustomerEmail(),
				    BirthDate: '1990-01-01T00:00:00',
				    Address :
				    {
					    Street: shippingAddress.getAddress1(),
					    City: shippingAddress.getCity(),
					    State: shippingAddress.getStateCode(),
					    Comp: shippingAddress.getCompanyName(),
					    ZipCode: shippingAddress.getPostalCode(),
					    Country: shippingAddress.getCountryCode().displayValue,
					    Number: ''
				    },
				    Phones: [
					    {
						    Type: 0,
						    CountryCode: 1,
						    AreaCode: 0,
						    Number: shippingAddress.getPhone()
					    }
				    ]
			    },
			    Items: getItems(order),
			    SessionID: session.sessionID
		    }
	    ],
	    AnalysisLocation: analysisLocation,
	    Reanalysis: false
    };

    return JSON.stringify(sendRequest);
}

/**
 * Helper method to get the request for get operation
 * @param {Object} params - parameters
 * @returns {String} - JSON string
 */
function getGetRequest(params) {

	var order = params.order;
	var analysisLocation = getPreference('clearsale_AnalysisLocation').value;

	var getRequest = {
		ApiKey: getPreference('clearsale_ApiKey'),
	    LoginToken: params.token,
        Orders: [order.orderNo],
        AnalysisLocation: analysisLocation
	};

	return JSON.stringify(getRequest);
}

/**
 * Helper method to get card type
 * @param {String} cardType - the card type
 * @returns {Number}
 */
function getCardType(cardType) {

	var cards = {
		Diners: 1,
		Visa : 2,
		MasterCard: 3,
		'American Express': 5,
		HiperCard: 6,
		Aura: 7
	};

	// if card type not found return 4
	return cards[cardType] ? cards[cardType] : 4;

}

/**
 * Helper method to get line items for the request
 * @param {Order} order - order object
 * @returns {Array} - line items
 */
function getItems(order) {

	var items = [];
	var lineItems = order.getProductLineItems();

	for (var pli in lineItems) {

		var li = lineItems[pli];
		items.push({
			ProductId: li.getProductID(),
			ProductTitle: li.getProductName(),
			Price: li.getPriceValue(),
			Category: li.getCategoryID(),
			Quantity: li.getQuantityValue()
		});

	}

	return items;
}

/**
 * Process clear sale status and set order status based on the settings
 * @param status 
 * @param order 
 */
exports.processClearSaleStatus = function(status, order) {

	var statuses = {
		reproved: ['RPM','SUS','CAN','FRD','RPA','RPP'],
		analyzing: ['AMA','NVO'],
		approved: ['APA','APM']
	};

	if (statuses.analyzing.indexOf(status) > -1) {

		if (getPreference('clearsale_AnalyzingNotExport')) {
			Transaction.wrap(function(){
				order.setExportStatus(order.EXPORT_STATUS_NOTEXPORTED);
			});
		}
		
	} else if (statuses.reproved.indexOf(status) > -1) {

		if(getPreference('clearsale_ReprovedNotExport')) {
			Transaction.wrap(function(){
				order.setExportStatus(order.EXPORT_STATUS_NOTEXPORTED);
			});
		}

		if(getPreference('clearsale_ReprovedCancel')) {
			Transaction.wrap(function(){
				order.setStatus(order.ORDER_STATUS_CANCELLED);
				order.setCancelCode(status);
				order.setCancelDescription('Order cancelled due to ClearSale Reproved Status');
			});
		}

	} else if (statuses.approved.indexOf(status) > -1) {

		Transaction.wrap(function(){
			order.setExportStatus(order.EXPORT_STATUS_READY);
		});

	}
}