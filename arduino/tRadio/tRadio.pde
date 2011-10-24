#include <VirtualWire.h>


void setup() {
  Serial.begin(9600);
  Serial.println("setup");
  
  vw_set_tx_pin(8);
  vw_set_ptt_pin(2);
  vw_set_ptt_inverted(true);
  vw_setup(2000);
}

char msg = 0;
void loop() {
//  const char *msg = "Hello";

  digitalWrite(13, HIGH);
//  vw_send((uint8_t *)msg, strlen(msg));
  vw_send((uint8_t *)&msg, 1);
  digitalWrite(13, LOW);
  
  msg++;
  delay(200);
}
