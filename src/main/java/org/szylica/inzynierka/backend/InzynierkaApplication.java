package org.szylica.inzynierka.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.szylica.inzynierka.backend.repository.LocalRepository;
import org.szylica.inzynierka.backend.repository.VisitRepository;
import org.szylica.inzynierka.backend.service.LocalService;

@SpringBootApplication
public class InzynierkaApplication {

    public static void main(String[] args) {
        SpringApplication.run(InzynierkaApplication.class, args);

    }

    //TODO
    // Uslugodawca który ma lokale powinien mieć możliwość wyboru z jakim wyprzedzeniem klienci mogą się umawiać do jego
    // lokalu. Może byc zhardcodowane np. 2 tyg, 1 msc, 3 msc, 6msc i 1 rok.
    // Gdy będzie zmieniać, np zmniejszać to wizyty

    //TODO
    // Walidacja danych, co jeśli ktoś wprowadzi godzina zamknięcia < godzina otwarcia

    //TODO
    // Bundle, aby komunikaty w zależności od lokalizacji były w róznych językach

    //TODO
    // Globalna obsługa wyjątków z ExceptionHandler
}
