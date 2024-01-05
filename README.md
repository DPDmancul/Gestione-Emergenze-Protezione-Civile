<!-- vim: set tw=80 : -->

Applicazione gestionale delle emergenze per le squadre locali di Protezione
Civile.

# Indice

- [Guida all'uso](#guida-alluso)
    - [Gestione emergenze](#gestione-emergenze)
    - [Gestione interventi](#gestione-interventi)
    - [Visualizzare gli interventi](#visualizzare-gli-interventi)
    - [Cambio cartografia](#cambio-cartografia)
    - [Gestione dello storico](#gestione-dello-storico)
    - [Amministrazione](#amministrazione)
    - [Impostazioni](#impostazioni)
- [Compilazione e installazione](#compilazione-e-installazione)
    - [Compilazione](#compilazione)
    - [Prerequisiti](#prerequisiti)
    - [Installazione](#installazione)
- [Licenza](#licenza)

# Guida all'uso

![Schermata principale](https://dpdmancul.gitlab.io/gepc_screenshoots/Screenshot_20200828_134506.png)

## Gestione emergenze

### Creare un'emergenza

È possibile creare un'emergenza premendo il pulsante blu `+ Emergenza` o
durante la creazione di un intervento.

Le emergenze contengono uno o più [*interventi*](#gestione-interventi) correlati.

### Chiudere un'emergenza

Quando tutti i suoi interventi sono finiti, per chiudere un'emergenza premere
il pulsante arancione `Chiudi emergenza`.

Le emergenze chiuse sono sempre visibili nello [*storico*](#gestione-dello-storico).

[*Torna all'indice*](#indice)

## Gestione interventi

### Creare un intervento

È possibile creare un intervento premendo il pulsante blu `+ Intervento`.

![Creazione intervento](https://dpdmancul.gitlab.io/gepc_screenshoots/Screenshot_20200828_134246.png)

Compariranno dei campi per creare l'intervento:

- nome intervento
- [*emergenza*](#gestione-emergenze) a cui appartiene l'intervento
- tipo di intervento
- indirizzo
- posizione GPS (fare click sulla mappa per inserirla ed eventualmente
    trascinare la puntina sul punto esatto)
- contatto
- risorse usate
- eventuali note

Al termine premere il pulsante verde `Crea`.

## Visualizzare gli interventi

Gli interventi sono visibili nella barra laterale sinistra all'interno della
relativa emergenza e anche sulla mappa (come puntine). Premendo su un intervento
nella barra laterale la mappa verrà centrata sulla posizione dell'intervento.
premendo sulla puntina verranno mostrate le informazioni sull'intervento

![Informazioni intevento](https://dpdmancul.gitlab.io/gepc_screenshoots/Screenshot_20200828_134428.png)

### Stato di un intervento

Un intervento può avere 3 stati:

1. Creato (blu)
2. Preso in carico (rosso)
3. Finito (grigio)

Per avanzare di stato usare l'apposito pulsante nella nuvoletta informativa
dell'intervento che compare premendo sulla puntina dell'evento.

### Spostare un intervento

Nella nuvoletta informativa dell'intervento che compare premendo sulla puntina
dell'evento, premere il pulsante con quattro frecce in alto a destra. Muovere la
puntina e salvare la nuova posizione.

### Modificare un intervento

Nella nuvoletta informativa dell'intervento che compare premendo sulla puntina
dell'evento, premere il pulsante con una penna su cella in alto a destra.
Effettuare le modifiche alle informazioni dell'intervento. Alla fine premere il
pulsante verde `Salva`.

![Modifica intevento](https://dpdmancul.gitlab.io/gepc_screenshoots/Screenshot_20200828_134446.png)

[*Torna all'indice*](#indice)

## Cambio cartografia

Per cambiare cartografia utilizzare il pulsante in alto a destra nella mappa.

Sono disponibili 3 cartografie:

- stradale
- satellitare
- ibrida

![Cambio cartografia](https://dpdmancul.gitlab.io/gepc_screenshoots/Screenshot_20200828_120711.png)

[*Torna all'indice*](#indice)

## Gestione dello storico

Per aprire lo storico andare nel menù `Strumenti` e selezionare la voce `Tutte
le emergenze`, in alternativa usare la scorciatoia `Ctrl+E`.

Verrà mostrato il riepilogo di tutte le emergenze con i relativi interventi e
dettagli. È possibile inoltre riaprire un'emergenza chiusa in anticipo premendo
il pulsante rosso `Riapri`, come stampare il riepilogo di un'emergenza premendo
il pulsante bianco `Stampa` sempre a destra dell'emergenza.

![Storico emergenze](https://dpdmancul.gitlab.io/gepc_screenshoots/Screenshot_20200828_121339.png)

È possibile filtrare le emergenze per nome e/o per anno utilizzando la ricerca
veloce in alto a destra. per una ricerca più approfondita si può utilizzare la
ricerca avanzata che permette di trovare (ed eventualmente filtrare) tutti gli
interventi in cui è stata coinvolta una particolare risorsa (anche volontari) e
di stampare un riepilogo della ricerca.

![Ricerca avanzata](https://dpdmancul.gitlab.io/gepc_screenshoots/Screenshot_20200828_121425.png)

[*Torna all'indice*](#indice)

## Amministrazione

### Gestione risorse

Per aprire il gestore delle risorse andare nel menù `Strumenti` e selezionare la
voce `Gestione risorse`, in alternativa usare la scorciatoia `Ctrl+R`.

![Apertura gestione risorse](https://dpdmancul.gitlab.io/gepc_screenshoots/Screenshot_20200828_120840.png)

Le risorse gestibili sono:

- tipi di intervento
- volontari del gruppo di Protezione Civile (risorse umane)
- attrezzatura disponibile
- mezzi disponibili

![Gestione risorse](https://dpdmancul.gitlab.io/gepc_screenshoots/Screenshot_20200828_121056.png)

1. Aggiunta risorse

   Per aggiungere una risorsa scrivere il nome nella casella di testo
   nella sezione adeguata, successivamente premere il tasto \~Invio\] o
   il pulsante blu `+`. Al termine premere il pulsante verde
   `Salva`.

2. Modifica di una risorsa

   Per modificare il nome di una risorsa è sufficiente premere il
   pulsante di modifica (penna su cella blu) a destra della risorsa,
   modificare il nome nella casella di testo che comparirà e infine
   salvare la modifica premendo il tasto `Invio` o cliccando lo stesso
   pulsante.

   ![Modifica risorsa](https://dpdmancul.gitlab.io/gepc_screenshoots/Screenshot_20200828_121138.png)

   Se la modifica è finita premere il pulsante verde
   `Salva`, altrimenti effettuare altre modifiche o per
   annullare la modifica premere la freccia blu a destra della risorsa
   modificata. È possibile modificare più risorse prima di salvare. Per
   annullare tutte le modifiche premere `Annulla`.

   ![Annulla modifica risorsa](https://dpdmancul.gitlab.io/gepc_screenshoots/Screenshot_20200828_121209.png)

3. Eliminare una risorsa

   Per eliminare una risorsa è sufficiente premere il pulsante di
   cancellazione (cestino rosso) a destra della risorsa. La risorsa
   eliminata sarà mostrata barrata fino al salvataggio.

   ![Eliminazione risorsa](https://dpdmancul.gitlab.io/gepc_screenshoots/Screenshot_20200828_121218.png)

   Se la modifica è finita premere il pulsante verde
   `Salva` altrimenti effettuare altre modifiche o per
   annullare l'eliminazione premere la freccia rossa a destra della
   risorsa eliminata. È possibile modificare più risorse prima di
   salvare. Per annullare tutte le modifiche premere
   `Annulla`.

    [*Torna all'indice*](#indice)

## Impostazioni

Per aprire le impostazioni andare nel menù `Strumenti` e selezionare la voce
`Impostazioni`, in alternativa usare la scorciatoia `Ctrl+I`.

![Impostazioni](https://dpdmancul.gitlab.io/gepc_screenshoots/Screenshot_20200828_120936.png)

Qui si potrà:

- cambiare il nome del gruppo di Protezione Civile (ricordarsi di
    premere il pulsante adiacente per salvare il cambiamento)
- impostare la visuale di default della mappa nella posizione attuale
    (per quando viene aperto l'applicativo)
- effettuare un backup (si consigliare di effettuare periodicamente un
    backup e salvarlo su un supporto esterno conservato in un'altra
    struttura e di mantenere le ultime copie di backup)
- ripristinare un backup (si consiglia di contattare lo sviluppatore
    in questa evenienza)

[*Torna all'indice*](#indice)

# Compilazione e installazione

## Compilazione

La compilazione di questo programma è gestita da `npm` (node 18).

Un ambiente completo di sviluppo è disponibile mediante docker:

```sh
docker-compose run --rm dev
```

Per installare le dipendenze lanciare:

``` sh
npm install
```

Per testare questo programma dare:

``` sh
npm test
```

Per generare l'eseguibile installabile:

``` sh
npm run build
```

I limiti della cartografia vanno impostati nel file
`app/Home/MapController.js`:

``` js
$scope.maxbounds={
  southWest: {
    lat: 45.5275,
    lng: 11.7279
  },
  northEast: {
    lat: 46.6984,
    lng: 14.5184
  }
}
```

## Prerequisiti

Per poter eseguire questo programma è necessario un server MySQL.

## Installazione

1. Avviare `gepc_0.1.1_installer_x64.exe`;
2. Al termine verrà segnalato erroneamente un errore: premere \"close\"
   e chiudere l'applicazione;
3. Installare la cartografia:
   1. Scaricare (ad esempio da [Open Street
      Maps](https://github.com/species/osm-tiledownloader)[^1]) la zona desiderata
   2. Inserirla nelle cartelle \"stradale\" e \"satellitare\" nella cartella in
      cui è stato installato il programma (`C:\Users\nome_utente\AppData\Local\gestione-emergenze-protezione-civile`).
4. Al primo avvio verranno chiesti i dati di connessione al database MySQL.

# Licenza

Questo software è distribuito con licenza [AGPL 3.0](LICENSE)

[*Torna all'indice*](#indice)

[^1]: Bisogna scegliere il server da cui scaricare le tiles con
    l'argomento `--url` (qui un elenco dei server:
    <https://wiki.openstreetmap.org/wiki/Tiles> e
    <https://wiki.openstreetmap.org/wiki/Aerial_imagery>). Inoltre coi
    parametri `--min-zoom` e `--max-zoom` si deve
    impostare i livelli di zoom da scaricare (ad esempio 13 e 14 per il
    satellitare e da 12 a 15 per lo stradale). Con i parametri
    `--top`, `--bottom`, `--left` e
    `--right` si restringe la zona da scaricare (qui si
    possono trovare i valori: <https://www.openstreetmap.org/export>).

