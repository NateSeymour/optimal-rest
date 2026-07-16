import {type Ref} from "vue";
import {getAirport} from "../hooks/flight.ts";

export const validateAirportCode = (iata: Ref<string>, opts: any) => ({
  ...opts,
  validator() {
    const airport = getAirport(iata.value);

    if(!airport) {
      return new Error(`${iata.value} is not a valid airport code.`);
    }
  },
});