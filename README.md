# SalesForce Commerce Cloud ClearSale cartridge 
This integration cartridge is built to connect online ecommerce stores to the ClearSale Fraud Prevention Solution. 
After this integration, ClearSale will provide decisions on orders that have been placed in your store. 

 
## Requirements
It is required to have a ClearSale account to use this cartridge. 
If you need credentials to access our system please fill the [form](https://clear.sale/getstarted)

## Compatibility

The cartridge was developed on the SiteGenesis version 104.1.3 of the Salesforce Commerce Cloud Platform. 
During the development and testing of the cartridge the Compatibility Mode was always set to 18.10

## Setup

The first and the most important step is to deploy the cartridges on staging along with the storefront code. 
After that it must be configured in the effective cartridge path.

## Configuration

To complete the integration of the cartridge the following configuration are to be made to Salesforce Commerce Cloud Business Manager for seamless execution of cartridge

#### **Business Manager Configurations**

a.	Once the uploading of the is completed, login to Business Manager (BM) and go to Administration - > Sites - > Manage Site

b.	Click on the link Business Manager Site 

c.	See “Cartridges” text field containing a “:” colon separated list of cartridge names.

d.	Type “int_clearsale” followed by colon ‘:’ at the end of the list and press “Apply” button. If this is the only cartridge there is no need to put a colon at the end.

e.	Once it is configured the name of the cartridge will appear in the “Effective Cartridge Path” as shown and will be ready for use.

#### **Importing Metadata**

a.	To do that, zip the site_template folder under sites to a file called site_template.zip

b.	Log in to Business Manager and then go to Administration > Site Development > Site Import & Export

c.	Upload the site_template.zip file and once it is uploaded select it from the list and hit the import button.

#### **Custom Site Preferences**

a.	To set the custom site preferences with the preferred values go to Merchant Tools > Site Preferences > Custom Preferences 
 
b.	Click on ClearSale Settings then a list of site preferences will be displayed 

c.	Configure the API Key provided by ClearSale
 
d.	Appropriately set the values of the other settings


| Preference | Values [Default] | Description |
| ---------- | ------ | ----------- |
|Do not export orders if ClearSale is Analyzing |   Yes/**[No]** | If set to ‘Yes’, the NOT_EXPORTED status will be set on the order | 
|Do not export orders if ClearSale has Reproved  | Yes/**[No]**	| If set to ‘Yes’, the NOT_EXPORTED status will be set on the order |
|Cancel order if ClearSale has Reproved | Yes/**[No]** |	If set to ‘Yes’, the order will be cancelled| 

 
#### **Services Configurations**

a.	Go to Administration > Operations > Services and you should be able to see the service for Clearsale. However, during import the credentials are not copied by Commerce Cloud due to security reasons therefore you will have to put the right credentials.
 
b.	Click on the credentials Tab and you will see credentials for Production and Sandbox
 
c.	Click on the name of the credentials for which you want to change the value.

d.	Put the correct user and password for the environment on which you want to test and click the apply button.
 
e.	In case you want to switch between LIVE and SANDBOX credentials you have to go to the Services Tab again and click the name of the service.

f.	Select the Credentials that you want to apply for this service and click Apply button.

#### **Job Configurations**

a.	For configuring jobs go to Administration > Operations > Job Schedules and here you should be able to see two jobs
 
b.	Make sure that the Execution scope of the jobs match your storefront site 

c.	If it does not match, click on each of the jobs and go to Step Configurator
 
d.	Click on the blue button in front of the Scope label and you will see a list of available sites to choose. Choose the site for which you want to run the job and click assign.
 
e.	To configure the job schedules go back to Administration > Operations > Job Schedules and here you should be able to see two jobs
 
f.	Click on OrderExport and go to Schedule and History Tab.  

g.	Do the following steps to configure the job.

h.	Select the From date to be the current date.

i.	Leave the To date empty (so the job has no end date)

j.	Set the Run Time to be Every Amount 10 and Interval Minutes (so that the export job runs every 10 mins

k.	Select all days from Run on these days so the job runs every

l.	Do not forget to Enable the job by clicking the checkbox on the top as shown below.
 
m.	Click on OrderStatusImport and go to Schedule and History Tab.  

n.	Do the following steps to configure the job.

o.	Select the From date to be the current date.

p.	Leave the To date empty (so the job has no end date)

q.	Set the Run Time to be Every Amount 10 and Interval Minutes (so that the export job runs every 10 mins)

r.	Select all days from Run on these days so the job runs every

s.	Do not forget to Enable the job by clicking the checkbox on the top as shown below.

## Custom code

There are no changes required in the storefront code to integrate this cartridge.

## Firewall Requirements

There is no need to get the IP of the service whitelisted as the communication is based on standard http ports.

## User Guide

If you want to check the status of the order returned by ClearSale in Business Manager, follow the steps provided below:

a.	Navigate to  Merchant Tools > Ordering > Orders 

b.	Search/Open the order for which you want to know the status

c.	Click on the ‘Attributes’ tab

d.	You should see the status under ‘ClearSale Status’ field 

e.	In Commerce Cloud, the status can be one of the following: 

| Status | Description |
| ------ | ----------- |
| NVO | New |
| APM | Approved |
| CAN | Cancelled by Client |
| RPM | Denied |

