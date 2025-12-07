# Dokumentacja Projektu HackNation

Ten projekt to gra RPG w stylu kasynowym, gdzie gracz walczy z bossami, używając mechanik gier losowych i logicznych.

## Spis Treści
1. [Opis Ogólny](#opis-ogólny)
2. [Poziom 1: Mroczna Kaczka (Kamień, Papier, Nożyce)](#poziom-1-mroczna-kaczka)
3. [Poziom 2: Kościany Boss (Kościany Poker)](#poziom-2-kościany-boss)
4. [Poziom 3: Król Lotek (Zgadnij Liczbę)](#poziom-3-król-lotek)

---

## Opis Ogólny

Gra opiera się na turowych walkach z bossami. Gracz posiada swoje statystyki (Zdrowie, Atak, Obrona), które wpływają na przebieg starć. Pomiędzy walkami gracz może ulepszać swoją postać.

---

## Poziom 1: Mroczna Kaczka

Walka opiera się na klasycznej grze w **Kamień, Papier, Nożyce**.

### Zasady:
1. **Wybór**: W każdej turze gracz i boss wybierają jeden z trzech symboli: Kamień, Papier lub Nożyce.
2. **Rozstrzygnięcie**:
   - **Kamień** wygrywa z Nożycami.
   - **Papier** wygrywa z Kamieniem.
   - **Nożyce** wygrywają z Papierem.
3. **Obrażenia**:
   - **Wygrałeś**: Zadajesz obrażenia bossowi równe Twojemu Atakowi.
   - **Przegrałeś**: Boss zadaje Ci 5 punktów obrażeń (zredukowane o Twoją Obronę).
   - **Remis**: Nikt nie otrzymuje obrażeń.

---

## Poziom 2: Kościany Boss

Walka stylizowana na grę w kości (podobną do Yahtzee/Makao).

### Zasady:
1. **Rzut**: Rzucasz 6 kośćmi.
2. **Punktacja**: Celem jest uzyskanie jak najwyższego wyniku z wyrzuconych oczek. Wynik przeliczany jest na obrażenia (Wynik / 10).
3. **Kombinacje Punktowane**:
   - **Jedynki (1)**: 100 pkt za każdą (jeśli są mniej niż 3 sztuki).
   - **Piątki (5)**: 50 pkt za każdą (jeśli są mniej niż 3 sztuki).
   - **Trójki (3 takie same)**:
     - 3 x 1 = 1000 pkt
     - 3 x [X] = X * 100 pkt (np. 3 x 2 = 200 pkt, 3 x 6 = 600 pkt).
   - **Mnożniki (więcej niż 3 takie same)**:
     - 4 sztuki = Wartość Trójki * 2
     - 5 sztuk = Wartość Trójki * 4
     - 6 sztuk = Wartość Trójki * 8
   - **Strit (kolejne liczby)**:
     - 1-2-3-4-5 (5 kości) = 500 pkt
     - 2-3-4-5-6 (5 kości) = 750 pkt
     - 1-2-3-4-5-6 (6 kości) = 1500 pkt
4. **Tura Bossa**: Boss nie rzuca kośćmi, lecz zadaje losowe obrażenia z puli: [5, 10, 20, 35, 50], gdzie niższe wartości wypadają częściej.

---

## Poziom 3: Król Lotek

Gra polega na zgadywaniu wylosowanej liczby (Lotto).

### Zasady:
1. **Wybór**: Wybierasz jedną liczbę z zakresu od 1 do 10.
2. **Losowanie**: Boss losuje swoją liczbę (również 1-10).
3. **Rozstrzygnięcie**:
   - **Trafienie (Twoja liczba == Liczba Bossa)**: Wygrywasz! Zadajesz bossowi potężne obrażenia oparte na Twoim Ataku.
   - **Pudło (Inna liczba)**: Przegrywasz. Boss zadaje Ci 10 punktów obrażeń.

## Role:
1. **Sprites**: Bartosz Molski i Sergiusz Kutny
2. **Music**: Dawid Wereszka
3. **Sound effects**: Sergiusz Kutny i Dawid Wereszka
4. **Coding**: Łukasz Ryszowski, Piotr de Biberstein Kazimirski i Sergiusz Kutny with the help of Antigravity
5. **Backgrounds**: Nano Banana AI was used
6. **Voiceover**: Eleven Labs AI was used
