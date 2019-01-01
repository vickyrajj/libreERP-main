import logging
import binascii
import datetime
import sys
import os
from os import path
from django.conf import settings as globalSettings

from fedex_config import CONFIG_OBJ
from fedex.services.ship_service import FedexProcessShipmentRequest

GENERATE_IMAGE_TYPE = 'PDF'

logging.basicConfig(stream=sys.stdout, level=logging.INFO)



def createShipment(recipientName , recipientCompany , recipientPhone , recipientAddress , city , state , pincode , country , weight):
    customer_transaction_id = "*** ShipService Request v17 using Python ***"  # Optional transaction_id
    shipment = FedexProcessShipmentRequest(CONFIG_OBJ, customer_transaction_id=customer_transaction_id)
    shipment.RequestedShipment.DropoffType = 'BUSINESS_SERVICE_CENTER'
    shipment.RequestedShipment.ServiceType = 'PRIORITY_OVERNIGHT'
    shipment.RequestedShipment.PackagingType = 'FEDEX_PAK'


    # Shipper address.
    shipment.RequestedShipment.Shipper.Contact.PersonName = 'Sender Name'
    shipment.RequestedShipment.Shipper.Contact.CompanyName = 'Some Company'
    shipment.RequestedShipment.Shipper.Contact.PhoneNumber = '9012638716'

    shipment.RequestedShipment.Shipper.Address.StreetLines = ['Address Line 1']
    shipment.RequestedShipment.Shipper.Address.City = 'Herndon'
    shipment.RequestedShipment.Shipper.Address.StateOrProvinceCode = 'VA'
    shipment.RequestedShipment.Shipper.Address.PostalCode = '20171'
    shipment.RequestedShipment.Shipper.Address.CountryCode = 'US'
    shipment.RequestedShipment.Shipper.Address.Residential = True

    # Recipient contact info.
    shipment.RequestedShipment.Recipient.Contact.PersonName =recipientName
    shipment.RequestedShipment.Recipient.Contact.CompanyName = recipientCompany
    shipment.RequestedShipment.Recipient.Contact.PhoneNumber = recipientPhone

    shipment.RequestedShipment.Recipient.Address.StreetLines = recipientAddress
    shipment.RequestedShipment.Recipient.Address.City = city
    shipment.RequestedShipment.Recipient.Address.StateOrProvinceCode = state
    shipment.RequestedShipment.Recipient.Address.PostalCode = pincode
    shipment.RequestedShipment.Recipient.Address.CountryCode = country





    # This is needed to ensure an accurate rate quote with the response. Use AddressValidation to get ResidentialStatus
    shipment.RequestedShipment.Recipient.Address.Residential = True
    shipment.RequestedShipment.EdtRequestType = 'NONE'
    shipment.RequestedShipment.ShippingChargesPayment.Payor.ResponsibleParty.AccountNumber = CONFIG_OBJ.account_number
    shipment.RequestedShipment.ShippingChargesPayment.PaymentType = 'SENDER'
    shipment.RequestedShipment.LabelSpecification.LabelFormatType = 'COMMON2D'
    shipment.RequestedShipment.LabelSpecification.ImageType = GENERATE_IMAGE_TYPE
    shipment.RequestedShipment.LabelSpecification.LabelStockType = 'PAPER_7X4.75'
    shipment.RequestedShipment.ShipTimestamp = datetime.datetime.now().replace(microsecond=0).isoformat()
    shipment.RequestedShipment.LabelSpecification.LabelPrintingOrientation = 'TOP_EDGE_OF_TEXT_FIRST'
    if hasattr(shipment.RequestedShipment.LabelSpecification, 'LabelOrder'):
        del shipment.RequestedShipment.LabelSpecification.LabelOrder  # Delete, not using.

    package1_weight = shipment.create_wsdl_object_of_type('Weight')
    package1_weight.Value = weight
    package1_weight.Units = "LB"
    package1 = shipment.create_wsdl_object_of_type('RequestedPackageLineItem')
    package1.PhysicalPackaging = 'ENVELOPE'
    package1.Weight = package1_weight
    package1.SpecialServicesRequested.SpecialServiceTypes = 'SIGNATURE_OPTION'
    package1.SpecialServicesRequested.SignatureOptionDetail.OptionType = 'SERVICE_DEFAULT'
    shipment.add_package(package1)
    shipment.send_request()
    print("HighestSeverity: {}".format(shipment.response.HighestSeverity))
    print("Tracking #: {}"
          "".format(shipment.response.CompletedShipmentDetail.CompletedPackageDetails[0].TrackingIds[0].TrackingNumber))

    CompletedPackageDetails = shipment.response.CompletedShipmentDetail.CompletedPackageDetails[0]
    if hasattr(CompletedPackageDetails, 'PackageRating'):
        print("Net Shipping Cost (US$): {}"
              "".format(CompletedPackageDetails.PackageRating.PackageRateDetails[0].NetCharge.Amount))
    else:
        print('WARNING: Unable to get shipping rate.')

    ascii_label_data = shipment.response.CompletedShipmentDetail.CompletedPackageDetails[0].Label.Parts[0].Image
    trackingId = shipment.response.CompletedShipmentDetail.CompletedPackageDetails[0].TrackingIds[0].TrackingNumber
    print trackingId ,'GGGGGGGGGGGGGG'
    label_binary_data = binascii.a2b_base64(ascii_label_data)

    # out_path = 'example_shipment_label.%s' % GENERATE_IMAGE_TYPE.lower()
    filepath = os.path.join(globalSettings.BASE_DIR,'media_root/ecommerce/manifest','example_shipment_label'+trackingId + '.pdf')
    # print("Writing to file {}".format(out_path))
    out_file = open(filepath, 'wb')
    out_file.write(label_binary_data)
    out_file.close()

    return filepath , trackingId

if __name__ == '__main__':
    awbPath , trackingID = createShipment('name' , 'company' , '99999999' , ['Address Line 1'] ,  'Herndon', 'VA' , '20171' , 'US',  1.0)

    print "AWB : " , awbPath
    print "Tracking ID : " , trackingID
