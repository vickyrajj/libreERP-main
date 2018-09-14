from escpos.connections import getUSBPrinter


printer = getUSBPrinter()(idVendor=0x154f,
                          idProduct=0x154f,
                          inputEndPoint=0x0,
                          outputEndPoint=0x02) # Create the printer object with the connection params

printer.text("Hello World")
printer.lf()

#154f:154f
# lsusb -vvv -d 154f:154f | grep iInterface
# lsusb -vvv -d 154f:154f | grep bEndpointAddress | grep OUT
