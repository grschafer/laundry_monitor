#include <VirtualWire.h>


void setup() {
  Serial.begin(9600);
  Serial.println("setup");
  Serial.print("maxmsglen:");
  Serial.println(VW_MAX_MESSAGE_LEN);
  Serial.print("maxpayload:");
  Serial.println(VW_MAX_PAYLOAD);
  
  vw_set_rx_pin(3);
  vw_setup(2000);
  vw_rx_start();
}


void loop() {
  uint8_t buf[VW_MAX_MESSAGE_LEN];
  uint8_t buflen = VW_MAX_MESSAGE_LEN;
  
  if (vw_get_message(buf, &buflen)) {
    int i;
    
    digitalWrite(13, HIGH);
    Serial.print("Got: ");
    
    for (i = 0; i < buflen; i++) {
      Serial.print(buf[i], DEC);
      Serial.print(" ");
    }
    Serial.println();
    digitalWrite(13, LOW);
  }
}
