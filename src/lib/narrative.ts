import { Character, StageInput, EncounterResult } from "./types";

// ─── Säätaulukot (vuodenaika × maasto) ────────────────────────────────────────

const WEATHER_BY_SEASON_TERRAIN: Record<string, Record<string, string[]>> = {
  winter: {
    arctic:    ["Raivoava lumimyrsky raastaa jokaisen paljaaksi jääneen ihon palaseksi.", "Lumiaan hiljaisuus peittää erämaan; jokainen hengenveto höyryää jäisessä ilmassa.", "Jäinen sumu laskeutuu, heikentäen näkyvyyden tuskin kymmenen jalan päähän."],
    forest:    ["Lumisalvaiset oksat pudottelevat taakkansa pehmeillä tömähdyksillä, säikäyttäen seurueen.", "Jäätynyt aluskasvillisuus murinee askelparin alla ilmoittaen jokaisen askeleen.", "Polun päällä on ohut jääkuori, joka tekee etenemisestä tukalan vaarallista."],
    grassland: ["Harmaat pilvet painuvat alas; kitkerä tuuli peltaa viimeiset kuolleet ruohot jäisestä maasta.", "Räntä sihailee viittoja ja rinkoja vasten, kastelee kaiken läpikotaisin.", "Kinokset ovat paikoin peittäneet tien; suunnistaminen on arvauspeli."],
    mountain:  ["Myrskyntuulet uhkaavat repiä matkustajat paljaalta harjanteelta.", "Jääpuikot miekan kokoisia riippuvat jokaisesta ulkonemasta.", "Tuore lumisade on pyyhkinyt polun kokonaan."],
    hill:      ["Pakastava sumu takertuu kukkulanlaelle koko aamun ennen kuin se harvenee harmaaksi sumuverhodeksi.", "Pikimusta jää väijyy alasrinteillä.", "Tuuli voivottaa paljaiden orjantappurapensaiden välissä kaukaisena pillisoittona."],
    coast:     ["Merivesisuihku jäätyy jokaiselle pinnalle; suolainentuuli purree syvälle.", "Myrskynharmaat aallot paukuttavat rantaa; pauhina on lakkaamatonta.", "Yön aikana vuorovesialtaisiin on muodostunut jääkerros."],
    swamp:     ["Jäälevyt naljuttavat uhkaavasti suo-ojien päällä.", "Jäätyneet järvikaislat rapisevat tuulessa kuin luurankosormet.", "Usva leijuu matalana jäätyneen suon yläpuolella aamuisessa kylmyydessä."],
    desert:    ["Yöt olivat melkein jäätäviä; keskipäivällä palaa ohut lämpö, mutta ei koskaan tarpeeksi.", "Terävä, kuiva tuuli hankaa dyynejä, kasaten hiekkaa jokaista kiveä vasten.", "Taivas on haaleaa, talvista sinistä — kaunista ja täysin armotonta."],
    underdark: ["Kylmyys tihkuu kivistä; tiputus putoaa katosta hitaassa, rytmisessä tahtina.", "Maanalaiset ilmavirtaukset kantavat syvän jään hajua.", "Lämpötila on vakaa mutta aina kylmä, muistutus siitä, kuinka kaukana alla maailma on."],
    urban:     ["Huurrekukat kukkivat jokaisella ikkunaruudulla; noppakivet ovat tappavan liukkaita.", "Ohut lumikerros peittää kattoja; savu nousee sadoista savupiipuista.", "Katukauppiaat tömisttelevät jalkojaan ja vetävät huivejaan tiukemmalle."],
    waterborne:["Räntä pärskyttää kannella; jokainen köysi on jäykistynyt jäästä.", "Talvinen myrsky pakottaa miehistön laskemaan purjeet ja ratsastamaan sen läpi.", "Sumu on niin tiheää, että rannikko on kadonnut; vain kompassi antaa suunnan."],
    default:   ["Kylmyys on armoton, laskeutuen niveliin ja hidastaen jokaista askelta.", "Harmaa, talvinen taivas ei tarjoa lämpöä edes keskipäivällä.", "Tuuli löytää jokaisen aukon viitasta ja haarniskasta."],
  },
  spring: {
    arctic:    ["Lyhyt sulaminen on muuttanut jään vaaralliseksi sohjoksi.", "Sulamisvedet tulvivat jokaista matalaa polkua; seurue kastelee enemmän kuin kävelee.", "Lumi takertuu yhä pohjoisenpuoleisille rinteille, mutta aurinko pysyy pidempään."],
    forest:    ["Metsä elää lintujen laulusta ja lumisulannasta korkeista oksista tippuvasta vedestä.", "Vaaleita vihreitä versoja nousee viime vuoden lehtikarikkeesta.", "Kuurosat saapuvat varoittamatta, muuttaen polun mudaksi minuuteissa."],
    grassland: ["Villokukat alkavat kirjoa niittyjä keltaisella ja violetilla.", "Arvaamaton kevätkuuro kastaa seurueen, ohittaa sitten minuuteissa.", "Lämmin eteläntuuli kantaa uuden maan tuoksua."],
    mountain:  ["Lumisulanto valuu jokaista uomaa pitkin, muuttaen tyynit purot kuohuviksi virroiksi.", "Ilma on korkealla kirkasta ja kylmää, kantaen männyn ja sateen tuoksua.", "Kirkkaan auringonvalon pilkut vuorottelevat juoksevien pilvivarjojen kanssa rinteillä."],
    hill:      ["Kukkulat ovat vihreitä ja märkiä; jokainen huippu tarjoaa laajan, pilvienviihtymän maiseman.", "Leikkisä tuuli pitää taivaan liikkeessä, ei anna pilvien asettua pitkäksi aikaa.", "Tuore muta tarttuu saappaisiin ja nilkkoihin puolipäivään mennessä."],
    coast:     ["Kevään vuorovesi on korkealla; seurueen täytyy ajoittaa rantaylityksensä huolellisesti.", "Merikotkia kieppuu päällä häntivien valkoisten pilvien vasten.", "Ilma maistuu suolalle, sateelle ja uudelle kasvulle kaikki yhdessä."],
    swamp:     ["Suo on täynnä sulamisvettä; jokainen askel uhkaa upota polveen saakka.", "Sammakot aloittavat valtavan kuoron näkymättömistä lammista.", "Keväthukat kukivat hämmästyttävän kirkkaana tummaa vettä vasten."],
    desert:    ["Lyhyt aavikokeväinen maalaa hiekat pienillä, epätodennäköisillä kukilla.", "Lämpimät päivät jo; seurue lähtee ennen auringonnousua välttääkseen pahimman helteen.", "Kuiva, mausteinen tuuli pyörittää dyynejä."],
    underdark: ["Kevätsateet yläpuolella ovat lisänneet veden tippumista luolakattojen läpi.", "Maanalaiset virrat juoksevat nopeina ja samean pinnan sedimentistä.", "Kalpeat sienet tuottavat muhkeat sienet ekstaattisin rykelmin."],
    urban:     ["Kaupunki on meluisa kevätjuhlista; köynnökset roikkuvat räystäiden välissä.", "Markkinapäivä on muuttanut jokaisen kadun stallien esteeksi.", "Lämmin iltapäiväsade lähettää kauppiaat hämmästyttämään markiisejensa alle."],
    waterborne:["Tuoreet kevääntuulet täyttävät purjeet; matka on nopea mutta puuskuttava.", "Lyhyt myrsky vyöryy läpi ja on kadonnut ennen kuin kukaan ehtii huolestua.", "Meri on vihreää ja aaltoilevaa, hyppivistä kaloista elävä."],
    default:   ["Arvaamaton keväinen päivä: lämmin aurinko, sitten kylmä suihku, sitten aurinko taas.", "Muta on jokaisen askeleen seuralainen.", "Maailma tuntuu uudelta ja levottomalta."],
  },
  summer: {
    arctic:    ["Täälläkin aurinko tuskin laskee; jatkuva valo on desorientoivaa.", "Ikiroudan pinta on pehmentynyt muutaman tuuman mudaksi.", "Parvet pisteleviä hyönteisiä parveilee soilta."],
    forest:    ["Latvusto on paksua ja vihreää, loukkuun sulkien lämpöä ja kosteutta kuin viitta.", "Kaukainen ukkonen jyrisee iltapäivällä, mutta sade ei koskaan oikein saavu.", "Kultaiset valonsäteet löytävät aukkoja lehdistä, pistelemällä polkua."],
    grassland: ["Aurinko hakkaa alas pilveettömästä taivaasta; ruoho on jo kellastumassa.", "Kuuma, välkkyvä auringonheijastus hämärtää horisontin aamupuolella.", "Hyönteiset surisevat taukoamatta korkeassa ruohossa molemmin puolin."],
    mountain:  ["Korkeusilma on armollisen viileämpää; helpotus jalan alaisten lounaiden jälkeen.", "Iltapäivän ukkoset rakentuvat huippujen yläpuolelle ja purkautuvat näyttävästi illalla.", "Kiviliskot ottavat aurinkoa jokaisella kivellä."],
    hill:      ["Kukkulan huippu antaa laajan näkymän loistavaan kesätaivaaseen.", "Lempeä tuulenpuuska pitää helteen hallittavana; ruoho tuoksuu ihastuttavalta.", "Kaukaiset heinäpellot täyttävät ilman hunajaisella lämmöllä."],
    coast:     ["Merituuli pitää helteen miellyttävänä rannan lähellä.", "Vesi on houkuttelevaa akvamariinia; kahlaaminen kiusaa, mutta aika on vähissä.", "Lokit väittelevät raikkaasti jotain vuorovesirantoja pitkin."],
    swamp:     ["Suo kesällä on julma: kuumuus, kosteus ja täyteläinen hyönteisverho.", "Vesi on muuttunut seisovaksi ja vihreäksi; haju on muistettava.", "Sammakot ja linnut kilpailevat ollakseen maailman äänekäs."],
    desert:    ["Kuumuus on fyysinen läsnäolo painuen ylhäältä alas ja säteillen alhaalta ylös.", "Varjokaan ei tarjoa juuri helpotusta; ilma itsessään tuntuu polttavan keuhkoja.", "Seurue lepää brutaalit puolipäivän tunnit ja matkustaa aamunkoitteessa ja hämärässä."],
    underdark: ["Maanalainen tarjoaa siunatun viileytensä; helpotus pintakuumuuden jälkeen.", "Bioluminesoivat sammalet hehkuvat himmeästi syvemmissä käytävissä.", "Sokeat kalat loiskivat maanalaisissa lammissa."],
    urban:     ["Kaupunki paistuu; pöly nousee pakkaiselta aukiolta.", "Ruuan tuoksu jokaisesta tavernaikkunasta on häiritsevästi hyvä.", "Lapset huutavat suihkulähteiden aukioilla vanhempiensa katsoessa."],
    waterborne:["Tasainen pasaatituuli täyttää purjeen; matka on sileää ja lämmintä.", "Lentävät kalat hyppivät rungon vierellä pitkänä kesäiltapäivänä.", "Meri on syvänsinistä ja melkein lasinen illalla."],
    default:   ["Aurinko on armoton ja pöly on paksua.", "Kuumuus roikkuu kaiken yläpuolella kuin lämmin peitto, jota kukaan ei pyytänyt.", "Jopa varjot ovat lämpimiä tänään."],
  },
  fall: {
    arctic:    ["Vuoden ensimmäinen vakava lumimyrsky pyyhkäisee pohjoisesta.", "Jää uudistuu tyynissä lammissa yöllä; aamut räsähtävät jalkojen alla.", "Tundra on muuttunut harmaaksi ja ruskeaksi; talvi valtaa takaisin alueensa."],
    forest:    ["Latvusto leimahtaa meripihkaan, karmiiniin ja kultaan; jokainen puuska tuo lehtisateen.", "Metsän lattia on pehmeä, kostea vaippa langenneista lehdistä.", "Aamuinen usva takertuu matalaan maastoon puolipäivään saakka."],
    grassland: ["Viima viilentää tuulta; taivas on rikas syyssininen.", "Pitkä kultainen ruoho taipuu aalloissa jokaisen puuskan edessä.", "Muuttavat linnut täyttävät taivaan pitkissä, toopottavissa jonoissa."],
    mountain:  ["Ensimmäinen lumipöly on ilmestynyt korkeimmille huipuille.", "Kylmä, kristallinen ilma tekee jokaisesta kaukodiikestä partateräväksi.", "Kalliosvyt ovat yleisempiä kun pakkanen halkoo kalliokasvoja."],
    hill:      ["Sananjalkaiset ovat syvän pronssin värisiä; kukkulanrinteet hehkuvat kallistuvassa iltapäivävalossa.", "Terävä länsituuli ajaa kuolleita lehtiä ohi vaakatasoisina virtoina.", "Märän maan ja lahon haju on oudosti miellyttävä."],
    coast:     ["Syystyrskyt alkavat; valkoislatvaiset aallot syöksyvät niemekkeitä vasten.", "Tuulessa on todellista purevuutta nyt; purjehtiminen on märkää ja jännittävää.", "Upea auringonlasku muuttaa meren vasaroituun kupariin."],
    swamp:     ["Suoruohot ovat muuttuneet ruskeiksi ja ruosteisiksi; siemenistä on heiluu tuulessa.", "Vesi on tyyntä, mutta mustalta näyttävää; kesän lämpö on valunut pois.", "Usva nousee suolta aamuhämärässä kuin hidaasti ulos hengitetty hengitys."],
    desert:    ["Syksy on armollinen aavikolle; kuumuus on katkennut ja matkustaminen on melkein miellyttävää.", "Viileät yöt sallivat kunnollisen levon ensimmäistä kertaa kuukausiin.", "Dyynit heittävät pitkiä, kauniita varjoja matalassa syysauringossa."],
    underdark: ["Syyssateet imevät kivien läpi; uusia purosia on ilmaantunut edellisestä käynnistä.", "Kylmyys palaa; seurueen hengitys huurteistuu lyhdynvalossa.", "Sienikasvustot ovat räjähtäneet kosteissa käytävissä."],
    urban:     ["Sadonkorjuujuhlan viirit roikkuvat rakennusten välissä; kadut tuoksuvat maustetulle siderille.", "Langenneet lehdet tukkivat viemärit ja pyörivät jokaisen ovenpielituulen mukana.", "Torikaupat pursuavat kurpitsoja, juurikasviksia ja säilöttyä lihaa."],
    waterborne:["Syystyrskyt voivat ilmestyä varoittamatta; kapteeni tarkkailee taivasta jatkuvasti.", "Meri on teräksen harmaa ja mahtipontinen; aalloilla on todellinen paino nyt.", "Sade tulee kuuroissa, jokainen kovempi kuin edellinen."],
    default:   ["Syksyn viileys on nyt kiistaton.", "Lehdet pyörtelevät puista jokaisessa puuskassa.", "Päivät lyhenevät huomattavasti."],
  },
};

function pickWeather(season: string, terrain: string, rng: () => number): string {
  const byTerrain = WEATHER_BY_SEASON_TERRAIN[season];
  const arr = byTerrain?.[terrain] ?? byTerrain?.["default"] ?? ["Sää on tavanomainen."];
  return arr[Math.floor(rng() * arr.length)];
}

// ─── Reittitapahtumat ─────────────────────────────────────────────────────────

const TRAIL_EVENTS: string[] = [
  "Hylätty nuotiopaikka, vielä heikosti lämmin, löytyy tien vierestä — kuka tahansa sen jätti, teki sen kiireesti.",
  "Vanhan harmaan kiven virstanpylväs, jonka kirjoitus on kulunut lähes lukukelvottomaksi, merkitsee vanhemman valtakunnan rajaa.",
  "Yksinäinen korppi seuraa seuruetta mailin verran, katsellen häiritsevällä älykkyydellä ennen kuin poistuu sanatta.",
  "Kaurisperhe seisoo jähmettyneinä polun keskellä, sitten katoaa aluskasvillisuuteen kuin heitä ei koskaan olisi ollutkaan.",
  "Joku on kaivanut tien reunusta äskettäin — jäljet viittaavat suureen metsäkarjuun, ja ne ovat tuoreita.",
  "Vaunun luuranko, puoliksi romahtanut, istuu ruosteen punaisena ojassa; lasti on kauan sitten kadonnut.",
  "Valtava hämähäkinverkko, aamukasteesta helmin koristeltu, on viritetty kahden puun välille suoraan polun poikki.",
  "Ryhmä tuoreesti hakattuja kantoja ympäröi hienon näkymän laakson ylle — joku on ollut täällä aivan äskettäin.",
  "Karu puinen pyhäkkö jumalalle, jota kukaan seurueesta ei tunnista, seisoo tienristeyksessä, pienin uhrilahjoin koristeltu.",
  "Suuren variksen ruumis roikkuu pää alaspäin oksalta yhden jalan varassa — kansanparannuskeino pahan onnen varalta.",
  "Kavionjäljet mudassa kääntyvät äkillisesti tieltä pois eikä palaa; selitystä ei näy.",
  "Lapsen lelu — veistetty puinen hevonen — istuu polun keskellä kuin se olisi varovaisesti laskettu alas ja sitten unohdettu.",
  "Kaukainen vasaroimisääni leijuu kukkuloiden yli; jossain tien ulkopuolella on menossa rakennustyö.",
  "Kauppiasvaunut tulee vastaan; kuljettaja nyökkää hattuaan ja vaihtaa muutaman sanan tien tilasta edessä.",
  "Vanha kaivo seisoo tien vieressä; vesi on kylmää ja erinomaista, ja joku on jättänyt puhtaan kupin reunalle.",
  "Haalistunut ilmoitus puuhun kiinnitettynä mainostaa palkkiota 'suuresta täplikäisestä kissasta' — juliste on kuukausia vanha.",
  "Sienikehä ympäröi kuollutta puuta matemaattisella tarkkuudella; seurue kiertää sen laajasti.",
  "Puunpolton haju on ilmassa puolen mailin ajan ennen kuin lähde — hiilenhakkaajan mökki — viimein erottuu.",
];

// ─── Henkilöhahmotapahtumat (luokan mukaan) ──────────────────────────────────

const CLASS_MOMENTS: Record<string, string[]> = {
  fighter: [
    "ottaa etuvartion, kilpi hieman kohotettuna vaikka tie on rauhallinen — vanhat tavat ovat sitkeässä.",
    "harjoittelee jalkatyötä lyhyissä lepohetkissä, pistäen kuvitteellisia vastustajia, kunnes joku pyytää lopettamaan.",
    "vaatii tarkastamaan leirintäalueen kehyksen ennen kuin asettuu iltaa viettämään.",
    "huomaa tienvarren vartiotornin rakenteellisen heikkouden ja käyttää kymmenen minuuttia selittäen, miten hyökkäisi siihen.",
  ],
  ranger: [
    "lukee suuren eläimen jäljistä pehmeässä maassa, huomioi suunnan, ja tallettaa tiedon kommentoimatta.",
    "tunnistaa kolme syötävää kasvia tienvarrelta ja täydentää seurueen muonavaroja tahtia hidastamatta.",
    "kutsuu pysähdyksen, kuuntelee lintujen laulun muuttuvan, sitten olankohautuksen ja heiluttaa seuruetta eteenpäin — pelkkä haukka.",
    "navigoi tähdillä ja maamerkeillä hiljaisella varmuudella, korjaten ryhmän suunnan kahdesti tekemättä siitä numeroa.",
  ],
  wizard: [
    "kirjoittaa käsittämättömiä kaavioita pieneen päiväkirjaan onnistuen samalla olemaan törmäämättä mihinkään.",
    "tunnistaa tieltä näkyvät rauniot Loitsupestikä edeltävän ajan tukikohdan jäänteiksi ja pitää lyhyen luennon kaikille halukkaille.",
    "väittelee kartan kanssa kaksikymmentä minuuttia ennen kuin toteaa, että kartta on väärässä.",
    "käyttää trikkiä nuotion sytyttämiseen ja näyttää sitten lievästi loukkaantuneelta, kun kukaan ei vaikutu.",
  ],
  rogue: [
    "tiedustelee puolen mailin päähän jokaisessa risteyksessä, palaten rentoutuneilla raporteilla, jotka jotenkin aina sisältävät arvokkuuksien sijainnin.",
    "auki lukon hylättyyn varastoon 'vain nähdäkseen, onko taito yhä tallella' — on.",
    "katoaa huolestuttavaksi kymmeneksi minuutiksi, sitten ilmestyy aivan eri suunnasta epäilyttävän selityksen puuttumisen kera.",
    "neuvottelee sillanmaksupisteen tullin alenemisesta, jättäen vartijan sekä keveämmäksi kukkarosta että epäileväisesti epävarmaksi, miten se tapahtui.",
  ],
  cleric: [
    "pysähtyy tienvarren pyhäkön äärellä jättääkseen pienen lahjan, siivoten paikan samalla.",
    "hoitaa seurueen jäsenen rakkon kantapäässä harjoitetulla tehokkuudella ja lievällä moitteella saappaan hoidosta.",
    "tarjoaa rukouksen leirillä — lyhyen, vilpittömän, ja juuri tarpeeksi pitkän ollakseen merkityksellinen ilman tympäisyyttä.",
    "huomaa läheisen maanviljelijän näyttävän huolestuneelta ja viettää neljännestunnin kuunnellen ennen kuin seurueen annetaan jatkaa.",
  ],
  paladin: [
    "pitää tasaisen, rohkaisevan kommentaarion koko marssin ajan, jonka seurue kokee joko innostavana tai uuvuttavana tunnista riippuen.",
    "kiillottaa haarniskaansa puolipäivän tauolla, mikä olisi vaikuttavampaa, jos haarniska ei olisi jo tarvinnut sitä kahden tunnin tien kävelemisen jälkeen.",
    "puuttuu tilanteeseen, kun kauppias joutuu ahdistelluksi tarkastuspisteellä, ja tilanne ratkeaa hämmästyttävällä nopeudella.",
    "tekee leiriluvuksista merkittävästi taistelevampia kuin tavallisesti — ilmeisesti tällä tienosalla on kunnioitettava historia.",
  ],
  bard: [
    "sepittää lyhyen säkeen maisemasta, joka on vilpittömästi ihan hyvä, mikä yllättää kaikki mukaanlukien bardin itsensä.",
    "juttelee tienvarren maanviljelijän kanssa kaksikymmentä minuuttia, irrottaen yllättävän paljon paikallista tietoa.",
    "asettaa marssirhytmin pirteällä laululla, joka nostaa tahtia huomattavasti seuraavan kahden tunnin ajan.",
    "kertoo tarinan nuotion ääressä joka alkaa vitsillä, muuttuu odottamatta surulliseksi ja päättyy koko seurueen hiljaiseen mietiskelyyn.",
  ],
  druid: [
    "pysähtyy siirtämään kilpikonnan tieltä lähellä olevalle ruohopaikalle ja selittää sitten ekologisen perustelun perusteellisesti.",
    "tunnistaa metsän mielialan pieneläinten liikkeiden kautta; arvio on 'jännittynyt mutta ei vihamielinen'.",
    "kutsuu lyhyen tuulenpuuskan puolipäivän tauolla viilentämään seuruetta; se saapuu tuoksuvan kaukaiselta sateelta.",
    "kommunikoi suuren tammen kanssa tienvarrella useita minuutteja; tammen raportti, ilmeisesti, on tapahtumaköyhä.",
  ],
  barbarian: [
    "vaatii kantaa raskaimpia rinkoja ja tekee sen täysin vaivattomasti, mikä on sekä avulias että hieman ärsyttävää.",
    "haastaa paikallisen majatalossa kättelykisaan selvittääkseen, onko tie edessä ylitettävissä — ja voittaa, lopullisesti.",
    "huomaa jotain liikkuvan puurivistössä, mikä osoittautuu peuraksi, mutta lyhyt valppausmomentti on vaikuttava.",
    "syö valtavasti puolipäivän tauolla, nukkuu tarkalleen kaksitoista minuuttia, ja herää virkistyneenä.",
  ],
  monk: [
    "meditoi aamunvalossa kaksikymmentä minuuttia, sitten ohittaa kaikki seuraavan kolmen tunnin ajan.",
    "tasapainottaa kaatuneen hirren yli puroa ylittäessä kantaen kahta rinkoa, koska vaihtoehto näytti epäelegantilta.",
    "huomaa epätasaiset noppakivet sadan yaardin päässä ilman ilmeistä syytä ja ohjaa seurueen piilossa olevan kaivon vierestä.",
    "esittää lyhyen filosofisen huomion matkasta, joka on joko syvällinen tai hyvin tylsä kuuntelijan mielialasta riippuen.",
  ],
  sorcerer: [
    "sytyttää vahingossa pienen taikavaikutuksen elehtiessään ilmaisevasti puheessaan — mikään ei onni syttymään, onneksi.",
    "on viimeinen valmis joka aamu ja ensimmäinen valittamaan puolipäivän jälkeen, mutta jotenkin pysyy sulostuttavana.",
    "esittelee trikkiä leveäsilmäiselle lapselle läheisellä maatilalla, sitten on yllättynyt, kuinka paljon se maksoi sosiaalista pääomaa vanhempien kanssa.",
    "nukahtaa satulaan eikä jotenkin putoa, minkä seurue päättää olla kyseenalaistamatta.",
  ],
  warlock: [
    "mutisee jotain kielellä, jota kukaan muu ei osaa, pimeää puurivistöä kohti, sitten heilauttaa kättä ja sanoo, ettei se ollut mitään.",
    "istuu erillään leirillä, kirjoittaen tummakantiseen päiväkirjaan kuolevan nuotion valossa, ja kieltäytyy jakamasta sisältöä.",
    "antaa pitkän selityksen läheisestä historiallisesta julmuudesta sillä yksityiskohtaisella tiedolla, kuin olisi itse ollut siellä — vaikka päivämäärät tekevät sen mahdottomaksi.",
    "tuijottaa taivasta muutaman minuutin joka yö, kuin odottaen signaalia. Ei tule. Tai ei mitä mainitsisi.",
  ],
  default: [
    "pitää tarkkaavaisen silmän tiellä edessä ja puurivistössä takana, vanha matkustajan tapa.",
    "tarjoaa muonaa sille, joka näyttää eniten matkavättyneeltä — pieni ele, mutta huomattu.",
    "tutkii maisemaa kävelyn aikana, vertaillen sitä mielessään opiskelemiinsa karttoihin.",
    "ottaa vuoron tiedustella seuraavaa mutkaa ennen kuin heilauttaa ryhmää eteenpäin.",
  ],
};

function pickCharacterMoment(character: Character, rng: () => number): string {
  const key = character.characterClass?.toLowerCase() ?? "default";
  const arr = CLASS_MOMENTS[key] ?? CLASS_MOMENTS["default"];
  const moment = arr[Math.floor(rng() * arr.length)];
  const name = character.name || "Matkustaja";
  return `${name} ${moment}`;
}

// ─── Leiri- ja lepotilanteet ──────────────────────────────────────────────────

const CAMP_OPENINGS: string[] = [
  "Valon hiipuessa seurue asettaa leirin suojaan",
  "Ilta löytää ryhmän pystyttämässä leiriä",
  "Auringon laskiessa ja jalkojen kipuillessa leiri pystytetään",
  "Ryhmä pysähtyy yöksi",
];

const CAMP_LOCATIONS_BY_TERRAIN: Record<string, string[]> = {
  forest:    ["laajan tammen juuria muistuttavia tukijalkoja", "sammaleen peitämän kuopan, johon tuuli ei ylety", "hopeavalkearingistä"],
  grassland: ["matalalta kukkulalta, josta on näkymä tielle molempiin suuntiin", "ojasta, joka katkaisee tuulen", "orapihlajapensaista"],
  mountain:  ["graniittikallion suojapuolelle", "matalaan luolaan, joka tuskin mahtuu koko seurueelle", "leveältä tasanteelta siirtolohkareiden yläpuolella"],
  hill:      ["kuopan alle kahden kohouman välissä, tieltä piilossa", "tuulen veistämien orapihlajien suojaan", "vanhan paimentolaismuurin viereen"],
  coast:     ["meripatsaan suojaan", "luolaan vuorovesilinjan yläpuolella", "aukosta dyynissä, jossa tuuli kuuluu muttei tunnu"],
  swamp:     ["kohoumalle, joka on juuri tarpeeksi leveä kaikille", "vääntyneistä pajuista koostuvan metsikön luo", "litteälle kivelle veden yläpuolella"],
  arctic:    ["jääkivien renkaaseen", "kilven ja saapasten kaivamaan lumihautaan", "ainoaan tuulensuojaan mailin säteellä"],
  desert:    ["hiekkakivipatsaan luo, joka pitää päivän lämpöä", "kuivuneen joensuojan luo, joka tarjoaa hieman suojaa yötuulelta", "riippaakasian alle, jossa varjoa optimistille"],
  underdark: ["leveään syvennökseen pääkäytävästä poissa", "luonnolliseen pilarisaliin, joka vaimentaa syvemmän pimeyden äänet", "kahden tunnelin risteykseen, puolustettavissa molemmista suunnista"],
  urban:     ["vaeltajien majatalo — kapea vuode ja lämmin ateria ovat kopin arvoisia", "talliin, joka tuoksuu odotettua paremmin", "tienvarren tavernan yhteishuoneeseen"],
  waterborne:["laivan kannelle öljyvahakankaan alle", "hyttiin kannellen alla vartion ottaessa ruorin", "rungon suojaan yöankkuroinnin aikana"],
  default:   ["parhaaseen saatavilla olevaan suojaan", "tien sivuun", "tasaiselle maanpalalle"],
};

const CAMP_MEAL_LINES: string[] = [
  "Illallinen on yksinkertainen mutta lämmin — sellainen ateria, joka maistuu paremmalle ansaittuna.",
  "Joku tuottaa pienen kuivatun makkaran ja kovaksi kypsytetyn juuston, joita kukaan ei tiennyt olevan olemassa tähän hetkeen asti, ja ansaitsee ryhmän ikuisen kiitollisuuden.",
  "Matkamuona. Taas. Syödään valittamatta mutta myös ilman innostusta.",
  "Onnellinen hieman aiemmin tapahtunut poimintaretki tarkoittaa, että tämän illan muhennoksessa on todellinen maku.",
  "Tulipesä ei vedä kunnolla; illallinen on savuista mutta kuumaa, mikä on tärkeintä.",
  "Viimeinen hyvä leipäpala jaetaan — tästä päivästä eteenpäin on kovaleipää ja kuivattua lihaa.",
];

const WATCH_LINES: string[] = [
  "Vartio kuluu tapahtumattomana; ainoat äänet ovat tuuli, hyönteiset ja kaukaiset eläimet askareineen.",
  "Kenellä tahansa on kesken yövartio jännittävä hetki, kun pöllö laskeutuu lähelle, sitten kolme hyvin ikävystyttävää tuntia sen jälkeen.",
  "Yö on hiljainen. Liian hiljainen. Mutta siitä ei tule mitään, ja aamuun mennessä kaikki ovat puoliksi unohtaneet tunteen.",
  "Tuli palaa matalana puoliyöhön mennessä ja se täytyy ruokkia; vartiovuorossa oleva käyttää tilaisuuden muutamaan lisälämmön minuuttiin.",
  "Eläin — todennäköisesti kettu, todennäköisesti — kiertää leirin kahdesti kolmannella tunnilla. Vartio huomioi sen ja jatkaa.",
];

// ─── Tahdin värikuvaukset ──────────────────────────────────────────────────────

const PACE_LINES: Record<string, string[]> = {
  fast: [
    "Tahti on tuskallinen. Keskustelu kuolee murinaksi ja käsisignaaleiksi aamun kuluessa.",
    "Tauot ovat julmasti lyhyitä — juuri tarpeeksi tyhjentämään vesileilikin ja siirtämään olkainhihnaa.",
    "Iltapäivällä kenenkään mielessä on vain seuraava virstanpylväs.",
    "Jokainen ylämäki maksaa enemmän kuin pitäisi tällä vauhdilla; alamäet tuntuvat lahjoilta.",
  ],
  normal: [
    "Matkustuksen rytmi asettuu ensimmäisen tunnin jälkeen — yksi jalka toisen eteen, tasainen ja kestävä.",
    "Puolipäivän pysähdys on kiireetöntä; leipää, vettä ja tilaisuus tarkistaa kartta.",
    "Keskustelu virtaa helposti maamerkkien välillä; mailit kuluvat anekdooteissa ja väittelyssä.",
    "Tahti on tarpeeksi mukava, että maisemaa voi tosiasiassa nauttia.",
  ],
  slow: [
    "Hidas tahti mahdollistaa kunnollisen havainnoinnin — jokainen jälki, jokainen taivaanranta, jokainen ääni huomataan.",
    "Seurue tiedustelee jokaisen osion huolellisesti; tie ei yllätä varovaisia silmiä.",
    "Aikaa on ruoanlaittohetkelle, levolle, keskustelulle, joka vie johonkin.",
    "Maisema paljastaa enemmän tällä tahdilla kuin pakkomarssin aikana — pienet yksityiskohdat kasautuvat tiedoksi.",
  ],
};

function pickPaceLine(pace: string, rng: () => number): string {
  const arr = PACE_LINES[pace] ?? PACE_LINES["normal"];
  return arr[Math.floor(rng() * arr.length)];
}

// ─── Kohtaamiskertomus ─────────────────────────────────────────────────────────

function encounterLines(encounter: EncounterResult): string {
  const lines: string[] = [];
  if (encounter.dayRoll.triggered) {
    lines.push(`Päiväaikainen uhka ilmaantuu: ${encounter.dayRoll.monsterCount} ${encounter.dayRoll.monsterName} tukkii tien eteenpäin. Tilanne vaatii välitöntä huomiota.`);
  }
  if (encounter.nightRoll.triggered) {
    lines.push(`Pimeyden suojissa ${encounter.nightRoll.monsterCount} ${encounter.nightRoll.monsterName} lähestyy leiriä. Vartio nostaa hälytyksen.`);
  }
  return lines.join("\n\n");
}

// ─── Päävienti ────────────────────────────────────────────────────────────────

export interface NarrativeOptions {
  /** A seedable rng function; if omitted Math.random is used. */
  rng?: () => number;
  /** Formatted arrival date string, e.g. "23 Kythorn 1491 DR". */
  endDateFormatted?: string;
}

export function generateNarrative(
  stage: StageInput,
  characters: Character[],
  encounter?: EncounterResult,
  options?: NarrativeOptions
): string {
  const rng = options?.rng ?? Math.random;

  const partyList =
    characters.length === 0
      ? "yksinäinen matkustaja"
      : characters
          .map((c) => `${c.name || "Tuntematon"} ${c.species || "kulkija"} ${c.characterClass || ""}`.trim())
          .join(", ");

  // Lähdön avaus
  const TIME_OPENINGS: Record<string, string> = {
    morning:   "Aamunvalossa, kaste vielä ruohossa,",
    afternoon: "Korkealla auringolla, aamun kylmyys kauan kadonnut,",
    evening:   "Varjojen pidetessä iltaa kohti,",
    night:     "Lyhyen levon jälkeen, tähtikaton alla,",
  };
  const departure = TIME_OPENINGS[stage.startTimeOfDay] ?? "Matkaan lähtiessä,";

  // Sää
  const weather = pickWeather(stage.season, stage.terrain, rng);

  // Tahtihuomio
  const paceObs = pickPaceLine(stage.pace, rng);

  // Reittikohtainen tapahtuma (noin 50 % todennäköisyys)
  const trailEvent = rng() > 0.5
    ? TRAIL_EVENTS[Math.floor(rng() * TRAIL_EVENTS.length)]
    : "";

  // Henkilöhahmon hetki (1–2 hahmoa jos läsnä)
  const charMoments: string[] = [];
  if (characters.length > 0) {
    const c1 = characters[Math.floor(rng() * characters.length)];
    charMoments.push(pickCharacterMoment(c1, rng));
    if (characters.length > 1 && rng() > 0.4) {
      const otherChars = characters.filter((c) => c.id !== c1.id);
      if (otherChars.length > 0) {
        const c2 = otherChars[Math.floor(rng() * otherChars.length)];
        charMoments.push(pickCharacterMoment(c2, rng));
      }
    }
  }

  // Leirikohtaus
  const campOpening = CAMP_OPENINGS[Math.floor(rng() * CAMP_OPENINGS.length)];
  const campLocArr = CAMP_LOCATIONS_BY_TERRAIN[stage.terrain] ?? CAMP_LOCATIONS_BY_TERRAIN["default"];
  const campLoc = campLocArr[Math.floor(rng() * campLocArr.length)];
  const campMeal = CAMP_MEAL_LINES[Math.floor(rng() * CAMP_MEAL_LINES.length)];
  const watch    = WATCH_LINES[Math.floor(rng() * WATCH_LINES.length)];

  // Kohtaamisosio
  const encSection = encounter ? encounterLines(encounter) : "";

  // Saapumishuomio
  const arrivalNote = options?.endDateFormatted
    ? `Etappi päättyy ${options.endDateFormatted}.`
    : "";

  // Koosta
  const sections: string[] = [
    `**${stage.startLocation} → ${stage.endLocation}**`,
    "",
    `${departure} ${partyList} lähtee ${stage.startLocation}:sta kohti ${stage.endLocation}:a — ${stage.distanceMiles} mailia matkaa.`,
    "",
    weather,
    "",
    paceObs,
  ];

  if (trailEvent) {
    sections.push("", trailEvent);
  }

  if (charMoments.length > 0) {
    sections.push("");
    sections.push(...charMoments);
  }

  if (encSection) {
    sections.push("", encSection);
  }

  sections.push(
    "",
    `${campOpening} ${campLoc}. ${campMeal} ${watch}`,
  );

  if (arrivalNote) {
    sections.push("", arrivalNote);
  }

  return sections.join("\n");
}
