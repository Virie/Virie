import {HostListener, Component, OnInit, OnDestroy} from '@angular/core';
import {HttpService, MobileNavState} from '../http.service';
import {Subscription} from 'rxjs/Subscription';
import {CookieService} from 'angular2-cookie/core';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss'],
  providers: []
})

export class MarketComponent implements OnInit, OnDestroy {
  Offers: any;
  maxCount: number;
  currentPage: number;
  count: number;
  offset: number;
  limitList: any;
  lengthOffers: any;
  currentOffer: any;
  showDialog = false;
  getOffersSubscription: Subscription;
  visiblePagination: boolean;
  activeClass: string;
  loader: boolean;
  objectKeys = Object.keys;
  CurrencyFilter: boolean;
  ProductsFilter: boolean;
  currentSortingDirection: boolean;
  currentSortingField: any;
  filter_currency: any;
  filter_products: any;
  categoriesSorted: any;

  options: any = {
    timepicker: false,
    format12h: false,
    language: 'en-short'
  };
  date: Date = new Date;

  currency_from = false;
  currency_to = false;
  products_from = false;
  products_to = false;

  appSearchShow: boolean;

  selectionText: string;
  highlightedText: boolean;
  navIsOpen: boolean;


  public settlementCurrency: Array<{ rank: number, title: string, code: string }> = [
    {'rank': 1, 'code': 'USD', 'title': 'US dollar (USD)'},
    {'rank': 2, 'code': 'EUR', 'title': 'Euro (EUR)'},
    {'rank': 3, 'code': 'CNY', 'title': 'Chinese yuan (CNY)'},
    {'rank': 4, 'code': 'GBP', 'title': 'Pound sterling (GBP)'},
    {'rank': 5, 'code': 'CHF', 'title': 'Swiss frank (CHF)'},
    {'rank': 6, 'code': 'KRW', 'title': 'South Korean won (KRW)'},
    {'rank': 7, 'code': 'JPY', 'title': 'Japanese yen (JPY)'},
    {'rank': 8, 'code': 'BTC', 'title': 'Bitcoin (BTC)'},
    {'rank': 9, 'code': 'ETH', 'title': 'Ethereum (ETH)'},
    {'rank': 10, 'code': 'LTC', 'title': 'Litecoin (LTC)'},
    {'rank': 11, 'code': 'XMR', 'title': 'Monero (XMR)'},

    {'rank': 100, 'code': 'INR', 'title': 'Indian rupee (INR)'},
    {'rank': 100, 'code': 'BRR', 'title': 'Brazilian real (BRL)'},
    {'rank': 100, 'code': 'RUR', 'title': 'Russian ruble (RUB)'},
    {'rank': 100, 'code': 'AUD', 'title': 'Australian dollar (AUD)'},
    {'rank': 100, 'code': 'CAD', 'title': 'Canadian dollar (CAD)'},
    {'rank': 100, 'code': 'SGD', 'title': 'Singapore dollar (SGD)'},
    {'rank': 100, 'code': 'MYR', 'title': 'Malaysian dollar (ringgit) (MYR)'},
    {'rank': 100, 'code': 'AZN', 'title': 'Azerbaijan manat (AZN)'},
    {'rank': 100, 'code': 'ALL', 'title': 'Albanian lek (ALL)'},
    {'rank': 100, 'code': 'DZD', 'title': 'Algerian dinar (DZD)'},
    {'rank': 100, 'code': 'AOA', 'title': 'Angolan kwanza (AOA)'},
    {'rank': 100, 'code': 'ARS', 'title': 'Argentinian peso (ARS)'},
    {'rank': 100, 'code': 'AMD', 'title': 'Armenian dram (AMD)'},
    {'rank': 100, 'code': 'AWG', 'title': 'Aruban guilder (AWG)'},
    {'rank': 100, 'code': 'AFA', 'title': 'Afgani (AFN)'},
    {'rank': 100, 'code': 'BSD', 'title': 'Bahamian dollar (BSD)'},
    {'rank': 100, 'code': 'BDT', 'title': 'Bangladesh taka (BDT)'},
    {'rank': 100, 'code': 'BBD', 'title': 'Barbados dollar (BBD)'},
    {'rank': 100, 'code': 'BHD', 'title': 'Bahraini dinar (BHD)'},
    {'rank': 100, 'code': 'BZD', 'title': 'Belize dollar (BZD)'},
    {'rank': 100, 'code': 'BYB', 'title': 'Belarusian ruble (BYN)'},
    {'rank': 100, 'code': 'BGL', 'title': 'Bulgarian lev (BGN)'},
    {'rank': 100, 'code': 'BOB', 'title': 'Boliviano (BOB)'},
    {'rank': 100, 'code': 'BWP', 'title': 'Botswana pula (BWP)'},
    {'rank': 100, 'code': 'BND', 'title': 'Brunei dollar (ringgit) (BND)'},
    {'rank': 100, 'code': 'BMD', 'title': 'Bermudian dollar (BMD)'},
    {'rank': 100, 'code': 'BIF', 'title': 'Burundi franc (BIF)'},
    {'rank': 100, 'code': 'VUV', 'title': 'Vatu (VUV)'},
    {'rank': 100, 'code': 'HUF', 'title': 'Hungarian forint (HUF)'},
    {'rank': 100, 'code': 'VEB', 'title': 'Venezuelan bolivar (VEF)'},
    {'rank': 100, 'code': 'XCD', 'title': 'East Caribbean dollar (XCD)'},
    {'rank': 100, 'code': 'VND', 'title': 'Vietnamese dong (VND)'},
    {'rank': 100, 'code': 'HTG', 'title': 'Haitian gourde (HTG)'},
    {'rank': 100, 'code': 'GMD', 'title': 'Gaminia dalasi (GMD)'},
    {'rank': 100, 'code': 'GHC', 'title': 'Ghana cedi (GHS)'},
    {'rank': 100, 'code': 'GTQ', 'title': 'Guatemalan quetzal (GTQ)'},
    {'rank': 100, 'code': 'GNF', 'title': 'Guinea franc (GNF)'},
    {'rank': 100, 'code': 'GIP', 'title': 'Gibraltar pound (GIP)'},
    {'rank': 100, 'code': 'HNL', 'title': 'Honduran lempira (HNL)'},
    {'rank': 100, 'code': 'GEL', 'title': 'Georgian lari (GEL)'},
    {'rank': 100, 'code': 'ANG', 'title': 'Netherlands Antillan guilder (ANG)'},
    {'rank': 100, 'code': 'DKK', 'title': 'Danish krone (DKK)'},
    {'rank': 100, 'code': 'RSD', 'title': 'Dinar (RSD)'},
    {'rank': 100, 'code': 'AED', 'title': 'UAE dirham (AED)'},
    {'rank': 100, 'code': 'STD', 'title': 'Dobra (STD)'},
    {'rank': 100, 'code': 'ZWD', 'title': 'Zimbabwe dollar (ZWL)'},
    {'rank': 100, 'code': 'KYD', 'title': 'Cayman Islands dollar (KYD)'},
    {'rank': 100, 'code': 'SBD', 'title': 'Solomon Islands dollar (SBD)'},
    {'rank': 100, 'code': 'TTD', 'title': 'Trinidad and Tobago dollar (TTD)'},
    {'rank': 100, 'code': 'FJD', 'title': 'Fiji dollar (FJD)'},
    {'rank': 100, 'code': 'DOP', 'title': 'Dominican peso (DOP)'},
    {'rank': 100, 'code': 'EGP', 'title': 'Egyptian pound (EGP)'},
    {'rank': 100, 'code': 'ZMK', 'title': 'Zambia Kwacha (ZMW)'},
    {'rank': 100, 'code': 'NIO', 'title': 'Cordoba oro (NIO)'},
    {'rank': 100, 'code': 'ILS', 'title': 'Israeli shekel (ILS)'},
    {'rank': 100, 'code': 'IDR', 'title': 'Indonesian rupiah (IDR)'},
    {'rank': 100, 'code': 'JOD', 'title': 'Jordanian dinar (JOD)'},
    {'rank': 100, 'code': 'IQD', 'title': 'Iraqi dinar (IQD)'},
    {'rank': 100, 'code': 'IRR', 'title': 'Iranian rial (IRR)'},
    {'rank': 100, 'code': 'IEP', 'title': 'Irish pound (IEP)'},
    {'rank': 100, 'code': 'ISK', 'title': 'Iceland krona (ISK)'},
    {'rank': 100, 'code': 'YER', 'title': 'CYemeni rial (YER)'},
    {'rank': 100, 'code': 'KHR', 'title': 'Cambodian riel (KHR)'},
    {'rank': 100, 'code': 'QAR', 'title': 'Qatari rial (QAR)'},
    {'rank': 100, 'code': 'KES', 'title': 'Kenyan shilling (KES)'},
    {'rank': 100, 'code': 'PGK', 'title': 'Kina (PGK)'},
    {'rank': 100, 'code': 'CTP', 'title': 'Cyprus pound (CYP)'},
    {'rank': 100, 'code': 'COP', 'title': 'Colombian peso (COP)'},
    {'rank': 100, 'code': 'KMF', 'title': 'Comoro franc (KMF)'},
    {'rank': 100, 'code': 'BAM', 'title': 'Convertible mark (BAM)'},
    {'rank': 100, 'code': 'CRC', 'title': 'Costa Rican Colon (CRC)'},
    {'rank': 100, 'code': 'CUP', 'title': 'Cuban peso (CUP)'},
    {'rank': 100, 'code': 'KWD', 'title': 'Kuwaiti dinar (KWD)'},
    {'rank': 100, 'code': 'HRK', 'title': 'Kuna (HRK)'},
    {'rank': 100, 'code': 'KGS', 'title': 'Kyrgyzstan som (KGS)'},
    {'rank': 100, 'code': 'MMK', 'title': 'Kyat (MMK)'},
    {'rank': 100, 'code': 'LAK', 'title': 'Lao kip (LAK)'},
    {'rank': 100, 'code': 'LVL', 'title': 'Latvian lats (LVL)'},
    {'rank': 100, 'code': 'SLL', 'title': 'Leone (SLL)'},
    {'rank': 100, 'code': 'LRD', 'title': 'Liberian dollar (LRD)'},
    {'rank': 100, 'code': 'LBP', 'title': 'Lebanese pound (LBP)'},
    {'rank': 100, 'code': 'LYD', 'title': 'Libyan dinar (LYD)'},
    {'rank': 100, 'code': 'LTL', 'title': 'Lithuanian litas (LTL)'},
    {'rank': 100, 'code': 'LSL', 'title': 'Loti (LSL)'},
    {'rank': 100, 'code': 'MUR', 'title': 'Mauritius rupee (MUR)'},
    {'rank': 100, 'code': 'MRO', 'title': 'Mauritanian ouguiya (MRO)'},
    {'rank': 100, 'code': 'MKD', 'title': 'Macedonian denar (MKD)'},
    {'rank': 100, 'code': 'MWK', 'title': 'Malawi kwacha (MWK)'},
    {'rank': 100, 'code': 'MGF', 'title': 'Malagasy ariary (MGA)'},
    {'rank': 100, 'code': 'MVR', 'title': 'Maldives rufiyaa (MVR)'},
    {'rank': 100, 'code': 'MTL', 'title': 'Maltese lira (MTL)'},
    {'rank': 100, 'code': 'MAD', 'title': 'Moroccan dirham (MAD)'},
    {'rank': 100, 'code': 'MXN', 'title': 'Mexican peso (MXN)'},
    {'rank': 100, 'code': 'MZM', 'title': 'Mozambique metical (MZN)'},
    {'rank': 100, 'code': 'MDL', 'title': 'Moldovan leu (MDL)'},
    {'rank': 100, 'code': 'MNT', 'title': 'Mongolian tugrik (MNT)'},
    {'rank': 100, 'code': 'ERN', 'title': 'Eritrean nakfa (ERN)'},
    {'rank': 100, 'code': 'BTN', 'title': 'Bhutan ngultrum (BTN)'},
    {'rank': 100, 'code': 'NPR', 'title': 'Nepalese rupee (NPR)'},
    {'rank': 100, 'code': 'NGN', 'title': 'Nigerian naira (NGN)'},
    {'rank': 100, 'code': 'NZD', 'title': 'New Zealand dollar (NZD)'},
    {'rank': 100, 'code': 'PEN', 'title': 'Nuevo sol (PEN)'},
    {'rank': 100, 'code': 'TWD', 'title': 'New Taiwan dollar (TWD)'},
    {'rank': 100, 'code': 'NOK', 'title': 'Norwegian krone (NOK)'},
    {'rank': 100, 'code': 'OMR', 'title': 'Rial Omani (OMR)'},
    {'rank': 100, 'code': 'TOP', 'title': 'Paanga (TOP)'},
    {'rank': 100, 'code': 'PKR', 'title': 'Pakistan rupee (PKR)'},
    {'rank': 100, 'code': 'PYG', 'title': 'Paraguay guarani (PYG)'},
    {'rank': 100, 'code': 'PLN', 'title': 'Polish zloty (PLN)'},
    {'rank': 100, 'code': 'ROL', 'title': 'Romanian leu (RON)'},
    {'rank': 100, 'code': 'SVC', 'title': 'Salvadoran colon (SVC)'},
    {'rank': 100, 'code': 'WST', 'title': 'Samoan tala (WST)'},
    {'rank': 100, 'code': 'SAR', 'title': 'Saudi riyal (SAR)'},
    {'rank': 100, 'code': 'SZL', 'title': 'Swaziland lilangeni (SZL)'},
    {'rank': 100, 'code': 'KPW', 'title': 'North Korean won (KPW)'},
    {'rank': 100, 'code': 'SCR', 'title': 'Seychelles rupee (SCR)'},
    {'rank': 100, 'code': 'SYP', 'title': 'Syrian pound (SYP)'},
    {'rank': 100, 'code': 'SOS', 'title': 'Somali shilling (SOS)'},
    {'rank': 100, 'code': 'SDD', 'title': 'Sudanese pound (SDG)'},
    {'rank': 100, 'code': 'SRG', 'title': 'Surinamese dollar (SRD)'},
    {'rank': 100, 'code': 'THB', 'title': 'Thai baht (THB)'},
    {'rank': 100, 'code': 'TZS', 'title': 'Tanzanian shilling (TZS)'},
    {'rank': 100, 'code': 'KZT', 'title': 'Tenge (KZT)'},
    {'rank': 100, 'code': 'SIT', 'title': 'CURRENCY.SIT'},
    {'rank': 100, 'code': 'TND', 'title': 'Tunisian dinar (TND)'},
    {'rank': 100, 'code': 'TRY', 'title': 'Turkish lira (TRY)'},
    {'rank': 100, 'code': 'TMM', 'title': 'Turkmenistan manat (TMT)'},
    {'rank': 100, 'code': 'UGX', 'title': 'Ugandan shilling (UGX)'},
    {'rank': 100, 'code': 'UZS', 'title': 'Uzbekistan sum (UZS)'},
    {'rank': 100, 'code': 'UAH', 'title': 'Ukrainian hryvna (UAH)'},
    {'rank': 100, 'code': 'UYU', 'title': 'Peso Uruguayo (UYU)'},
    {'rank': 100, 'code': 'PHP', 'title': 'Philippine peso (PHP)'},
    {'rank': 100, 'code': 'DJF', 'title': 'Djibouti franc (DJF)'},
    {'rank': 100, 'code': 'XOF', 'title': 'CFA Franc BCEAO (XOF)'},
    {'rank': 100, 'code': 'XAF', 'title': 'CFA franc BEAC (XAF)'},
    {'rank': 100, 'code': 'XOP', 'title': 'CFA franc (XOP)'},
    {'rank': 100, 'code': 'XPF', 'title': 'CFP franc (XPF)'},
    {'rank': 100, 'code': 'RWF', 'title': 'Rwanda franc (RWF)'},
    {'rank': 100, 'code': 'FKP', 'title': 'Falkland Islands pound (FKP)'},
    {'rank': 100, 'code': 'CZK', 'title': 'Czech koruna (CZK)'},
    {'rank': 100, 'code': 'CLP', 'title': 'Chilean peso (CLP)'},
    {'rank': 100, 'code': 'SEK', 'title': 'Swedish krona (SEK)'},
    {'rank': 100, 'code': 'LKR', 'title': 'Sri Lanka rupee (LKR)'},
    {'rank': 100, 'code': 'ESC', 'title': 'Ecuadorian sucre (ECS)'},
    {'rank': 100, 'code': 'CVE', 'title': 'Cape Verde escudo (CVE)'},
    {'rank': 100, 'code': 'EEK', 'title': 'Estonian kroon (EEK)'},
    {'rank': 100, 'code': 'ETB', 'title': 'Ethiopian birr (ETB)'},
    {'rank': 100, 'code': 'ZAR', 'title': 'Namibian rand (ZAR)'},
    {'rank': 100, 'code': 'JMD', 'title': 'Jamaican dollar (JMD)'}
  ];

  public listCountry: Array<{ alpha2Code: string, name: string }> = [
    {
      'alpha2Code': 'ZD',
      'name': 'Abkhazia'
    },
    {
      'alpha2Code': 'AF',
      'name': 'Afghanistan'
    },
    {
      'alpha2Code': 'AX',
      'name': 'Åland Islands'
    },
    {
      'alpha2Code': 'AL',
      'name': 'Albania'
    },
    {
      'alpha2Code': 'DZ',
      'name': 'Algeria'
    },
    {
      'alpha2Code': 'AS',
      'name': 'American Samoa'
    },
    {
      'alpha2Code': 'AD',
      'name': 'Andorra'
    },
    {
      'alpha2Code': 'AO',
      'name': 'Angola'
    },
    {
      'alpha2Code': 'AI',
      'name': 'Anguilla'
    },
    {
      'alpha2Code': 'AG',
      'name': 'Antigua and Barbuda'
    },
    {
      'alpha2Code': 'AR',
      'name': 'Argentina'
    },
    {
      'alpha2Code': 'AM',
      'name': 'Armenia'
    },
    {
      'alpha2Code': 'AW',
      'name': 'Aruba'
    },
    {
      'alpha2Code': 'AU',
      'name': 'Australia'
    },
    {
      'alpha2Code': 'AT',
      'name': 'Austria'
    },
    {
      'alpha2Code': 'AZ',
      'name': 'Azerbaijan'
    },
    {
      'alpha2Code': 'BH',
      'name': 'Bahrain'
    },
    {
      'alpha2Code': 'BD',
      'name': 'Bangladesh'
    },
    {
      'alpha2Code': 'BB',
      'name': 'Barbados'
    },
    {
      'alpha2Code': 'BY',
      'name': 'Belarus'
    },
    {
      'alpha2Code': 'BE',
      'name': 'Belgium'
    },
    {
      'alpha2Code': 'BZ',
      'name': 'Belize'
    },
    {
      'alpha2Code': 'BJ',
      'name': 'Benin'
    },
    {
      'alpha2Code': 'BM',
      'name': 'Bermuda'
    },
    {
      'alpha2Code': 'BT',
      'name': 'Bhutan'
    },
    {
      'alpha2Code': 'BO',
      'name': 'Bolivia'
    },
    {
      'alpha2Code': 'BQ',
      'name': 'Bonaire'
    },
    {
      'alpha2Code': 'BA',
      'name': 'Bosnia and Herzegovina'
    },
    {
      'alpha2Code': 'BW',
      'name': 'Botswana'
    },
    {
      'alpha2Code': 'BV',
      'name': 'Bouvet Island'
    },
    {
      'alpha2Code': 'BR',
      'name': 'Brazil'
    },
    {
      'alpha2Code': 'IO',
      'name': 'British Indian Ocean Territory'
    },
    {
      'alpha2Code': 'VG',
      'name': 'British Virgin Islands'
    },
    {
      'alpha2Code': 'BN',
      'name': 'Brunei'
    },
    {
      'alpha2Code': 'BG',
      'name': 'Bulgaria'
    },
    {
      'alpha2Code': 'BF',
      'name': 'Burkina Faso'
    },
    {
      'alpha2Code': 'BI',
      'name': 'Burundi'
    },
    {
      'alpha2Code': 'KH',
      'name': 'Cambodia'
    },
    {
      'alpha2Code': 'CM',
      'name': 'Cameroon'
    },
    {
      'alpha2Code': 'CA',
      'name': 'Canada'
    },
    {
      'alpha2Code': 'CV',
      'name': 'Cape Verde'
    },
    {
      'alpha2Code': 'KY',
      'name': 'Cayman Islands'
    },
    {
      'alpha2Code': 'CF',
      'name': 'Central African Republic'
    },
    {
      'alpha2Code': 'TD',
      'name': 'Chad'
    },
    {
      'alpha2Code': 'CL',
      'name': 'Chile'
    },
    {
      'alpha2Code': 'CN',
      'name': 'China'
    },
    {
      'alpha2Code': 'CX',
      'name': 'Christmas Island'
    },
    {
      'alpha2Code': 'CC',
      'name': 'Cocos (Keeling) Islands'
    },
    {
      'alpha2Code': 'CO',
      'name': 'Colombia'
    },
    {
      'alpha2Code': 'KM',
      'name': 'Comoros'
    },
    {
      'alpha2Code': 'CK',
      'name': 'Cook Islands'
    },
    {
      'alpha2Code': 'CR',
      'name': 'Costa Rica'
    },
    {
      'alpha2Code': 'HR',
      'name': 'Croatia'
    },
    {
      'alpha2Code': 'CU',
      'name': 'Cuba'
    },
    {
      'alpha2Code': 'CW',
      'name': 'Curaçao'
    },
    {
      'alpha2Code': 'CY',
      'name': 'Cyprus'
    },
    {
      'alpha2Code': 'CZ',
      'name': 'Czech Republic'
    },
    {
      'alpha2Code': 'CD',
      'name': 'Democratic Republic of the Congo'
    },
    {
      'alpha2Code': 'DK',
      'name': 'Denmark'
    },
    {
      'alpha2Code': 'DJ',
      'name': 'Djibouti'
    },
    {
      'alpha2Code': 'DM',
      'name': 'Dominica'
    },
    {
      'alpha2Code': 'DO',
      'name': 'Dominican Republic'
    },
    {
      'alpha2Code': 'TL',
      'name': 'East Timor'
    },
    {
      'alpha2Code': 'EC',
      'name': 'Ecuador'
    },
    {
      'alpha2Code': 'EG',
      'name': 'Egypt'
    },
    {
      'alpha2Code': 'SV',
      'name': 'El Salvador'
    },
    {
      'alpha2Code': 'GQ',
      'name': 'Equatorial Guinea'
    },
    {
      'alpha2Code': 'ER',
      'name': 'Eritrea'
    },
    {
      'alpha2Code': 'EE',
      'name': 'Estonia'
    },
    {
      'alpha2Code': 'ET',
      'name': 'Ethiopia'
    },
    {
      'alpha2Code': 'FK',
      'name': 'Falkland Islands'
    },
    {
      'alpha2Code': 'FO',
      'name': 'Faroe Islands'
    },
    {
      'alpha2Code': 'FM',
      'name': 'Federated States of Micronesia'
    },
    {
      'alpha2Code': 'FJ',
      'name': 'Fiji'
    },
    {
      'alpha2Code': 'FI',
      'name': 'Finland'
    },
    {
      'alpha2Code': 'FR',
      'name': 'France'
    },
    {
      'alpha2Code': 'GF',
      'name': 'French Guiana'
    },
    {
      'alpha2Code': 'PF',
      'name': 'French Polynesia'
    },
    {
      'alpha2Code': 'TF',
      'name': 'French Southern and Antarctic Lands'
    },
    {
      'alpha2Code': 'GA',
      'name': 'Gabon'
    },
    {
      'alpha2Code': 'GE',
      'name': 'Georgia'
    },
    {
      'alpha2Code': 'DE',
      'name': 'Germany'
    },
    {
      'alpha2Code': 'GH',
      'name': 'Ghana'
    },
    {
      'alpha2Code': 'GI',
      'name': 'Gibraltar'
    },
    {
      'alpha2Code': 'GR',
      'name': 'Greece'
    },
    {
      'alpha2Code': 'GL',
      'name': 'Greenland'
    },
    {
      'alpha2Code': 'GD',
      'name': 'Grenada'
    },
    {
      'alpha2Code': 'GP',
      'name': 'Guadeloupe'
    },
    {
      'alpha2Code': 'GU',
      'name': 'Guam'
    },
    {
      'alpha2Code': 'GT',
      'name': 'Guatemala'
    },
    {
      'alpha2Code': 'GG',
      'name': 'Guernsey'
    },
    {
      'alpha2Code': 'GN',
      'name': 'Guinea'
    },
    {
      'alpha2Code': 'GW',
      'name': 'Guinea-Bissau'
    },
    {
      'alpha2Code': 'GY',
      'name': 'Guyana'
    },
    {
      'alpha2Code': 'HT',
      'name': 'Haiti'
    },
    {
      'alpha2Code': 'HM',
      'name': 'Heard Island and McDonald Islands'
    },
    {
      'alpha2Code': 'HN',
      'name': 'Honduras'
    },
    {
      'alpha2Code': 'HK',
      'name': 'Hong Kong'
    },
    {
      'alpha2Code': 'HU',
      'name': 'Hungary'
    },
    {
      'alpha2Code': 'IS',
      'name': 'Iceland'
    },
    {
      'alpha2Code': 'IN',
      'name': 'India'
    },
    {
      'alpha2Code': 'ID',
      'name': 'Indonesia'
    },
    {
      'alpha2Code': 'IR',
      'name': 'Iran'
    },
    {
      'alpha2Code': 'IQ',
      'name': 'Iraq'
    },
    {
      'alpha2Code': 'IM',
      'name': 'Isle of Man'
    },
    {
      'alpha2Code': 'IL',
      'name': 'Israel'
    },
    {
      'alpha2Code': 'IT',
      'name': 'Italy'
    },
    {
      'alpha2Code': 'CI',
      'name': 'Ivory Coast'
    },
    {
      'alpha2Code': 'JM',
      'name': 'Jamaica'
    },
    {
      'alpha2Code': 'JP',
      'name': 'Japan'
    },
    {
      'alpha2Code': 'JE',
      'name': 'Jersey'
    },
    {
      'alpha2Code': 'JO',
      'name': 'Jordan'
    },
    {
      'alpha2Code': 'KZ',
      'name': 'Kazakhstan'
    },
    {
      'alpha2Code': 'KE',
      'name': 'Kenya'
    },
    {
      'alpha2Code': 'KI',
      'name': 'Kiribati'
    },
    {
      'alpha2Code': 'KW',
      'name': 'Kuwait'
    },
    {
      'alpha2Code': 'KG',
      'name': 'Kyrgyzstan'
    },
    {
      'alpha2Code': 'LA',
      'name': 'Laos'
    },
    {
      'alpha2Code': 'LV',
      'name': 'Latvia'
    },
    {
      'alpha2Code': 'LB',
      'name': 'Lebanon'
    },
    {
      'alpha2Code': 'LS',
      'name': 'Lesotho'
    },
    {
      'alpha2Code': 'LR',
      'name': 'Liberia'
    },
    {
      'alpha2Code': 'ZF',
      'name': 'Liberland'
    },
    {
      'alpha2Code': 'LY',
      'name': 'Libya'
    },
    {
      'alpha2Code': 'LI',
      'name': 'Liechtenstein'
    },
    {
      'alpha2Code': 'LT',
      'name': 'Lithuania'
    },
    {
      'alpha2Code': 'LU',
      'name': 'Luxembourg'
    },
    {
      'alpha2Code': 'MO',
      'name': 'Macau'
    },
    {
      'alpha2Code': 'MG',
      'name': 'Madagascar'
    },
    {
      'alpha2Code': 'MW',
      'name': 'Malawi'
    },
    {
      'alpha2Code': 'MY',
      'name': 'Malaysia'
    },
    {
      'alpha2Code': 'MV',
      'name': 'Maldives'
    },
    {
      'alpha2Code': 'ML',
      'name': 'Mali'
    },
    {
      'alpha2Code': 'MT',
      'name': 'Malta'
    },
    {
      'alpha2Code': 'MH',
      'name': 'Marshall Islands'
    },
    {
      'alpha2Code': 'MQ',
      'name': 'Martinique'
    },
    {
      'alpha2Code': 'MR',
      'name': 'Mauritania'
    },
    {
      'alpha2Code': 'MU',
      'name': 'Mauritius'
    },
    {
      'alpha2Code': 'YT',
      'name': 'Mayotte'
    },
    {
      'alpha2Code': 'MX',
      'name': 'Mexico'
    },
    {
      'alpha2Code': 'MD',
      'name': 'Moldova'
    },
    {
      'alpha2Code': 'MC',
      'name': 'Monaco'
    },
    {
      'alpha2Code': 'MN',
      'name': 'Mongolia'
    },
    {
      'alpha2Code': 'ME',
      'name': 'Montenegro'
    },
    {
      'alpha2Code': 'MS',
      'name': 'Montserrat'
    },
    {
      'alpha2Code': 'MA',
      'name': 'Morocco'
    },
    {
      'alpha2Code': 'MZ',
      'name': 'Mozambique'
    },
    {
      'alpha2Code': 'MM',
      'name': 'Myanmar'
    },
    {
      'alpha2Code': 'NA',
      'name': 'Namibia'
    },
    {
      'alpha2Code': 'NR',
      'name': 'Nauru'
    },
    {
      'alpha2Code': 'NP',
      'name': 'Nepal'
    },
    {
      'alpha2Code': 'NL',
      'name': 'Netherlands'
    },
    {
      'alpha2Code': 'NC',
      'name': 'New Caledonia'
    },
    {
      'alpha2Code': 'NZ',
      'name': 'New Zealand'
    },
    {
      'alpha2Code': 'NI',
      'name': 'Nicaragua'
    },
    {
      'alpha2Code': 'NE',
      'name': 'Niger'
    },
    {
      'alpha2Code': 'NG',
      'name': 'Nigeria'
    },
    {
      'alpha2Code': 'NU',
      'name': 'Niue'
    },
    {
      'alpha2Code': 'NF',
      'name': 'Norfolk Island'
    },
    {
      'alpha2Code': 'KP',
      'name': 'North Korea'
    },
    {
      'alpha2Code': 'MP',
      'name': 'Northern Mariana Islands'
    },
    {
      'alpha2Code': 'NO',
      'name': 'Norway'
    },
    {
      'alpha2Code': 'OM',
      'name': 'Oman'
    },
    {
      'alpha2Code': 'PK',
      'name': 'Pakistan'
    },
    {
      'alpha2Code': 'PW',
      'name': 'Palau'
    },
    {
      'alpha2Code': 'PS',
      'name': 'Palestine'
    },
    {
      'alpha2Code': 'PA',
      'name': 'Panama'
    },
    {
      'alpha2Code': 'PG',
      'name': 'Papua New Guinea'
    },
    {
      'alpha2Code': 'PY',
      'name': 'Paraguay'
    },
    {
      'alpha2Code': 'PE',
      'name': 'Peru'
    },
    {
      'alpha2Code': 'PH',
      'name': 'Philippines'
    },
    {
      'alpha2Code': 'PN',
      'name': 'Pitcairn Islands'
    },
    {
      'alpha2Code': 'PL',
      'name': 'Poland'
    },
    {
      'alpha2Code': 'PT',
      'name': 'Portugal'
    },
    {
      'alpha2Code': 'PR',
      'name': 'Puerto Rico'
    },
    {
      'alpha2Code': 'QA',
      'name': 'Qatar'
    },
    {
      'alpha2Code': 'IE',
      'name': 'Republic of Ireland'
    },
    {
      'alpha2Code': 'XK',
      'name': 'Republic of Kosovo'
    },
    {
      'alpha2Code': 'MK',
      'name': 'Republic of Macedonia'
    },
    {
      'alpha2Code': 'CG',
      'name': 'Republic of the Congo'
    },
    {
      'alpha2Code': 'RE',
      'name': 'Réunion'
    },
    {
      'alpha2Code': 'RO',
      'name': 'Romania'
    },
    {
      'alpha2Code': 'RU',
      'name': 'Russia'
    },
    {
      'alpha2Code': 'RW',
      'name': 'Rwanda'
    },
    {
      'alpha2Code': 'BL',
      'name': 'Saint Barthélemy'
    },
    {
      'alpha2Code': 'SH',
      'name': 'Saint Helena'
    },
    {
      'alpha2Code': 'KN',
      'name': 'Saint Kitts and Nevis'
    },
    {
      'alpha2Code': 'LC',
      'name': 'Saint Lucia'
    },
    {
      'alpha2Code': 'MF',
      'name': 'Saint Martin'
    },
    {
      'alpha2Code': 'PM',
      'name': 'Saint Pierre and Miquelon'
    },
    {
      'alpha2Code': 'VC',
      'name': 'Saint Vincent and the Grenadines'
    },
    {
      'alpha2Code': 'WS',
      'name': 'Samoa'
    },
    {
      'alpha2Code': 'SM',
      'name': 'San Marino'
    },
    {
      'alpha2Code': 'ST',
      'name': 'São Tomé and Príncipe'
    },
    {
      'alpha2Code': 'SA',
      'name': 'Saudi Arabia'
    },
    {
      'alpha2Code': 'SN',
      'name': 'Senegal'
    },
    {
      'alpha2Code': 'RS',
      'name': 'Serbia'
    },
    {
      'alpha2Code': 'SC',
      'name': 'Seychelles'
    },
    {
      'alpha2Code': 'SL',
      'name': 'Sierra Leone'
    },
    {
      'alpha2Code': 'SG',
      'name': 'Singapore'
    },
    {
      'alpha2Code': 'SX',
      'name': 'Sint Maarten'
    },
    {
      'alpha2Code': 'SK',
      'name': 'Slovakia'
    },
    {
      'alpha2Code': 'SI',
      'name': 'Slovenia'
    },
    {
      'alpha2Code': 'SB',
      'name': 'Solomon Islands'
    },
    {
      'alpha2Code': 'SO',
      'name': 'Somalia'
    },
    {
      'alpha2Code': 'ZA',
      'name': 'South Africa'
    },
    {
      'alpha2Code': 'GS',
      'name': 'South Georgia'
    },
    {
      'alpha2Code': 'KR',
      'name': 'South Korea'
    },
    {
      'alpha2Code': 'ZE',
      'name': 'South Ossetia'
    },
    {
      'alpha2Code': 'SS',
      'name': 'South Sudan'
    },
    {
      'alpha2Code': 'ES',
      'name': 'Spain'
    },
    {
      'alpha2Code': 'LK',
      'name': 'Sri Lanka'
    },
    {
      'alpha2Code': 'SD',
      'name': 'Sudan'
    },
    {
      'alpha2Code': 'SR',
      'name': 'Suriname'
    },
    {
      'alpha2Code': 'SJ',
      'name': 'Svalbard and Jan Mayen'
    },
    {
      'alpha2Code': 'SZ',
      'name': 'Swaziland'
    },
    {
      'alpha2Code': 'SE',
      'name': 'Sweden'
    },
    {
      'alpha2Code': 'CH',
      'name': 'Switzerland'
    },
    {
      'alpha2Code': 'SY',
      'name': 'Syria'
    },
    {
      'alpha2Code': 'TW',
      'name': 'Taiwan'
    },
    {
      'alpha2Code': 'TJ',
      'name': 'Tajikistan'
    },
    {
      'alpha2Code': 'TZ',
      'name': 'Tanzania'
    },
    {
      'alpha2Code': 'TH',
      'name': 'Thailand'
    },
    {
      'alpha2Code': 'BS',
      'name': 'The Bahamas'
    },
    {
      'alpha2Code': 'GM',
      'name': 'The Gambia'
    },
    {
      'alpha2Code': 'TG',
      'name': 'Togo'
    },
    {
      'alpha2Code': 'TK',
      'name': 'Tokelau'
    },
    {
      'alpha2Code': 'TO',
      'name': 'Tonga'
    },
    {
      'alpha2Code': 'TT',
      'name': 'Trinidad and Tobago'
    },
    {
      'alpha2Code': 'TN',
      'name': 'Tunisia'
    },
    {
      'alpha2Code': 'TR',
      'name': 'Turkey'
    },
    {
      'alpha2Code': 'ZC',
      'name': 'Turkish Republic of Northern Cyprus'
    },
    {
      'alpha2Code': 'TM',
      'name': 'Turkmenistan'
    },
    {
      'alpha2Code': 'TC',
      'name': 'Turks and Caicos Islands'
    },
    {
      'alpha2Code': 'TV',
      'name': 'Tuvalu'
    },
    {
      'alpha2Code': 'UG',
      'name': 'Uganda'
    },
    {
      'alpha2Code': 'UA',
      'name': 'Ukraine'
    },
    {
      'alpha2Code': 'AE',
      'name': 'United Arab Emirates'
    },
    {
      'alpha2Code': 'GB',
      'name': 'United Kingdom'
    },
    {
      'alpha2Code': 'US',
      'name': 'United States'
    },
    {
      'alpha2Code': 'UM',
      'name': 'United States Minor Outlying Islands'
    },
    {
      'alpha2Code': 'UY',
      'name': 'Uruguay'
    },
    {
      'alpha2Code': 'UZ',
      'name': 'Uzbekistan'
    },
    {
      'alpha2Code': 'VU',
      'name': 'Vanuatu'
    },
    {
      'alpha2Code': 'VE',
      'name': 'Venezuela'
    },
    {
      'alpha2Code': 'VN',
      'name': 'Vietnam'
    },
    {
      'alpha2Code': 'WF',
      'name': 'Wallis and Futuna'
    },
    {
      'alpha2Code': 'EH',
      'name': 'Western Sahara'
    },
    {
      'alpha2Code': 'YE',
      'name': 'Yemen'
    },
    {
      'alpha2Code': 'ZM',
      'name': 'Zambia'
    },
    {
      'alpha2Code': 'ZW',
      'name': 'Zimbabwe'
    }
  ];

  public categoriesOriginal = [
    // CRYPTOCURRENCY
    {
      id: 'AAA',
      parent: 'ROO',
      title: 'Cryptocurrency',
      subcategories: [
        {
          id: 'AAB',
          parent: 'AAA',
          title: 'Buying and selling cryptocurrency'
        },
        {
          id: 'AAC',
          parent: 'AAA',
          title: 'Mining Hardware'
        },
        {
          id: 'AAD',
          parent: 'AAA',
          title: 'Other'
        }
      ]
    },
    {
      id: 'BAA',
      parent: 'ROO',
      title: 'Information and databases'
    },
    {
      id: 'CAA',
      parent: 'ROO',
      title: 'Software'
    },
    {
      id: 'DAA',
      parent: 'ROO',
      title: 'Books and magazines'
    },
    {
      id: 'EAA',
      parent: 'ROO',
      title: 'Gift coupons, certificates, and pre-paid cards'
    },
    {
      id: 'FAA',
      parent: 'ROO',
      title: 'Precious metals, gems, and jewelry'
    },
    {
      id: 'GAA',
      parent: 'ROO',
      title: 'Documentation'
    },
    {
      id: 'HAA',
      parent: 'ROO',
      title: 'Audio/video recordings'
    },

    // ELECTRONICS
    {
      id: 'IAA',
      parent: 'ROO',
      title: 'Electronics',
      subcategories: [
        {
          id: 'IAB',
          parent: 'IAA',
          title: 'Audio/video'
        },
        {
          id: 'IAC',
          parent: 'IAA',
          title: 'Video games and game consoles'
        },
        {
          id: 'IAD',
          parent: 'IAA',
          title: 'Desktop computers'
        },
        {
          id: 'IAE',
          parent: 'IAA',
          title: 'Laptops'
        },
        {
          id: 'IAF',
          parent: 'IAA',
          title: 'Office equipment and supplies'
        },
        {
          id: 'IAG',
          parent: 'IAA',
          title: 'Tablets and ebooks'
        },
        {
          id: 'IAH',
          parent: 'IAA',
          title: 'Phones'
        },
        {
          id: 'IAI',
          parent: 'IJA',
          title: 'Means of communication and the transmission of information'
        },
        {
          id: 'IAK',
          parent: 'IAA',
          title: 'Photography'
        },
        {
          id: 'IAL',
          parent: 'IAA',
          title: 'Other'
        }
      ]
    },
    // HOBBIES_AND_LEISURE
    {
      id: 'JAA',
      parent: 'ROO',
      title: 'Hobbies and leisure',
      subcategories: [
        {
          id: 'JAB',
          parent: 'JAA',
          title: 'Tickets and travel'
        },
        {
          id: 'JAC',
          parent: 'JAA',
          title: 'Collecting'
        },
        {
          id: 'JAD',
          parent: 'JAA',
          title: 'Musical instruments'
        },
        {
          id: 'JAE',
          parent: 'JAA',
          title: 'Hunting and fishing'
        },
        {
          id: 'JAF',
          parent: 'JAA',
          title: 'Sports and recreation, tourism'
        },
        {
          id: 'JAG',
          parent: 'JAA',
          title: 'Other'
        }
      ]
    },
    {
      id: 'KAA',
      parent: 'ROO',
      title: 'Security'
    },
    {
      id: 'LAA',
      parent: 'ROO',
      title: 'Plants and animals'
    },
    {
      id: 'MAA',
      parent: 'ROO',
      title: 'Medicine and pharmaceuticals'
    },

    // CHEMISTRY
    {
      id: 'NAA',
      parent: 'ROO',
      title: 'Chemistry',
      subcategories: [
        {
          id: 'NAB',
          parent: 'NAA',
          title: 'Chemical agents'
        },
        {
          id: 'NAC',
          parent: 'NAA',
          title: 'Equipment'
        },
        {
          id: 'NAD',
          parent: 'NAA',
          title: 'Other'
        }
      ]
    },
    // FOR_BUSINESS
    {
      id: 'OAA',
      parent: 'ROO',
      title: 'For business',
      subcategories: [
        {
          id: 'OAB',
          parent: 'OAA',
          title: 'Existing business'
        },
        {
          id: 'OAC',
          parent: 'OAA',
          title: 'Business equipment'
        },
        {
          id: 'OAD',
          parent: 'OAA',
          title: 'Other'
        }
      ]
    },
    // FOR_HOME
    {
      id: 'PAA',
      parent: 'ROO',
      title: 'For households',
      subcategories: [
        {
          id: 'PAB',
          parent: 'PAA',
          title: 'Antiques'
        },
        {
          id: 'PAC',
          parent: 'PAA',
          title: 'Small electronics'
        },
        {
          id: 'PAD',
          parent: 'PAA',
          title: 'Furniture and interior decorating'
        },
        {
          id: 'PAE',
          parent: 'PAA',
          title: 'Dishes and kitchen products'
        },
        {
          id: 'PAF',
          parent: 'PAA',
          title: 'Repair and construction'
        },
        {
          id: 'PAG',
          parent: 'PAA',
          title: 'Other'
        }
      ]
    },
    {
      id: 'QAA',
      parent: 'ROO',
      title: 'Groceries'
    },

    // PERSONAL_THINGS
    {
      id: 'RAA',
      parent: 'ROO',
      title: 'Personal items',
      subcategories: [
        {
          id: 'RAB',
          parent: 'RAA',
          title: 'Clothing, footwear, and accessories'
        },
        {
          id: 'RAC',
          parent: 'RAA',
          title: 'Beauty, cosmetics, and perfume/cologne'
        },
        {
          id: 'RAD',
          parent: 'RAA',
          title: 'Devices and accessories'
        },
        {
          id: 'RAE',
          parent: 'RAA',
          title: 'Other'
        }
      ]
    },
    // REAL_ESTATE
    {
      id: 'SAA',
      parent: 'ROO',
      title: 'Real estate',
      subcategories: [
        {
          id: 'SAB',
          parent: 'SAA',
          title: 'Apartments/condominiums'
        },
        {
          id: 'SAC',
          parent: 'SAA',
          title: 'Houses, cabins, cottages, and villas'
        },
        {
          id: 'SAD',
          parent: 'SAA',
          title: 'Agricultural plots'
        },
        {
          id: 'SAF',
          parent: 'SAA',
          title: 'Commercial real estate'
        },
        {
          id: 'SAG',
          parent: 'SAA',
          title: 'Other'
        }
      ]
    },
    // TRANSPORT
    {
      id: 'TAA',
      parent: 'ROO',
      title: 'Vehicles',
      subcategories: [
        {
          id: 'TAB',
          parent: 'TAA',
          title: 'Cars'
        },
        {
          id: 'TAC',
          parent: 'TAA',
          title: 'Trucks'
        },
        {
          id: 'TAD',
          parent: 'TAA',
          title: 'Special equipment'
        },
        {
          id: 'TAE',
          parent: 'TAA',
          title: 'Motorcycles'
        },
        {
          id: 'TAF',
          parent: 'TAA',
          title: 'Buses and minibuses'
        },
        {
          id: 'TAG',
          parent: 'TAA',
          title: 'Watercraft'
        },
        {
          id: 'TAH',
          parent: 'TAA',
          title: 'Aircraft'
        },
        {
          id: 'TAI',
          parent: 'TAA',
          title: 'Parts and accessories'
        },
        {
          id: 'TAJ',
          parent: 'TAA',
          title: 'Other'
        }
      ]
    },
    // SERVICES
    {
      id: 'UAA',
      parent: 'ROO',
      title: 'Services',
      subcategories: [
        // IT_INTERNET
        {
          id: 'UAB',
          parent: 'UAA',
          title: 'IT/internet',
          subcategories: [
            {
              id: 'UBL',
              parent: 'UAB',
              title: 'Software/network rental'
            },
            {
              id: 'UBM',
              parent: 'UAB',
              title: 'Information search'
            },
            {
              id: 'UBN',
              parent: 'UAB',
              title: 'Software installation and configuration'
            },
            {
              id: 'UBO',
              parent: 'UAB',
              title: 'Software development'
            },
            {
              id: 'UBP',
              parent: 'UAB',
              title: 'Software testing'
            },
            {
              id: 'UBQ',
              parent: 'UAB',
              title: 'Website creation'
            },
            {
              id: 'UBR',
              parent: 'UAB',
              title: 'Marketing, advertising, and PR'
            },
            {
              id: 'UBS',
              parent: 'UAB',
              title: 'Design'
            },
            {
              id: 'UBT',
              parent: 'UAB',
              title: 'Newsletters'
            },
            {
              id: 'UBU',
              parent: 'UAB',
              title: 'Other'
            }
          ]
        },
        // FINANCIAL_SERVICES
        {
          id: 'UAC',
          parent: 'UAA',
          title: 'Financial services',
          subcategories: [
            {
              id: 'UBV',
              parent: 'UAC',
              title: 'Underwriters'
            },
            {
              id: 'UBW',
              parent: 'UAC',
              title: 'Aggregators and payment processing'
            },
            {
              id: 'UBX',
              parent: 'UAC',
              title: 'Cash and non-cash transactions'
            },
            {
              id: 'UBY',
              parent: 'UAC',
              title: 'Currency exchange'
            },
            {
              id: 'UBZ',
              parent: 'UAC',
              title: 'Loans and credit'
            },
            {
              id: 'UCA',
              parent: 'UAC',
              title: 'Investments'
            },
            {
              id: 'UCB',
              parent: 'UAC',
              title: 'Marketplaces and auctions'
            },
            {
              id: 'UCC',
              parent: 'UAC',
              title: 'Other'
            }
          ]
        },
        {
          id: 'UAD',
          parent: 'UAA',
          title: 'Cryptocurrency2',
          subcategories: [
            {
              id: 'UCD',
              parent: 'UAD',
              title: 'Exchanges and exchangers'
            },
            {
              id: 'UCE',
              parent: 'UAD',
              title: 'Aggregators and payment processing'
            },
            {
              id: 'UCF',
              parent: 'UAD',
              title: 'Pools'
            },
            {
              id: 'UCG',
              parent: 'UAD',
              title: 'Other'
            }
          ]
        },
        {
          id: 'UVE',
          parent: 'UAA',
          title: 'Transport'
        },
        {
          id: 'UAF',
          parent: 'UAA',
          title: 'Task completion'
        },
        {
          id: 'UAG',
          parent: 'UAA',
          title: 'Sports'
        },
        {
          id: 'UAH',
          parent: 'UAA',
          title: 'Auto repair'
        },
        {
          id: 'UAI',
          parent: 'UAA',
          title: 'Vehicle rental'
        },
        {
          id: 'UAJ',
          parent: 'UAA',
          title: 'Domestic services'
        },
        {
          id: 'UAK',
          parent: 'UAA',
          title: 'Business services'
        },
        {
          id: 'UAL',
          parent: 'UAA',
          title: 'Art'
        },
        {
          id: 'UAM',
          parent: 'UAA',
          title: 'Beauty, health, and spa'
        },
        {
          id: 'UAN',
          parent: 'UAA',
          title: 'Courier deliveries'
        },
        {
          id: 'UAO',
          parent: 'UAA',
          title: 'Consulting'
        },
        {
          id: 'UAP',
          parent: 'UAA',
          title: 'Writing and proofreading services'
        },
        {
          id: 'UAQ',
          parent: 'UAA',
          title: 'Medical services'
        },
        {
          id: 'UAR',
          parent: 'UAA',
          title: 'Equipment and manufacturing'
        },
        {
          id: 'UAS',
          parent: 'UAA',
          title: 'Training and courses'
        },
        {
          id: 'UAT',
          parent: 'UAA',
          title: 'Security and protection'
        },
        {
          id: 'UAU',
          parent: 'UAA',
          title: 'Hotels and accommodations'
        },
        {
          id: 'UAV',
          parent: 'UAA',
          title: 'Information search'
        },
        {
          id: 'UAW',
          parent: 'UAA',
          title: 'Food and catering'
        },
        {
          id: 'UAX',
          parent: 'UAA',
          title: 'Holidays and events'
        },
        {
          id: 'UAY',
          parent: 'UAA',
          title: 'Translation'
        },
        {
          id: 'UAZ',
          parent: 'UAA',
          title: 'Entertainment and events'
        },
        {
          id: 'UBA',
          parent: 'UAA',
          title: 'Advertising and printing'
        },
        {
          id: 'UBB',
          parent: 'UAA',
          title: 'Equipment repair'
        },
        {
          id: 'UBC',
          parent: 'UAA',
          title: 'Construction and repair'
        },
        {
          id: 'UBD',
          parent: 'UAA',
          title: 'Gardening and landscaping'
        },
        {
          id: 'UBE',
          parent: 'UAA',
          title: 'Insurance'
        },
        {
          id: 'UBF',
          parent: 'UAA',
          title: 'Tourism and guided tours'
        },
        {
          id: 'UBG',
          parent: 'UAA',
          title: 'Cleaning'
        },
        {
          id: 'UBH',
          parent: 'UAA',
          title: 'Equipment installation'
        },
        {
          id: 'UBI',
          parent: 'UAA',
          title: 'Photography and video recording'
        },
        {
          id: 'UBJ',
          parent: 'UAA',
          title: 'Legal services'
        },
        {
          id: 'UBK',
          parent: 'UAA',
          title: 'Other'
        }
      ]
    },
    {
      id: 'VAA',
      parent: 'ROO',
      title: 'Other'
    },
    {
      id: 'WAA',
      parent: 'ROO',
      title: 'Donation and crowdfunding'
    }
  ];


  public offerDate: Array<{ text: string, value: string }> = [
    {text: 'hour', value: '1h'},
    {text: 'three hours', value: '3h'},
    {text: 'day', value: '1d'},
    {text: 'two days', value: '2d'},
    {text: 'three days', value: '3d'},
    {text: 'week', value: '7d'},
    {text: 'period', value: 'period'}
  ];
  public listSettlementMethod: Array<{ text: string, value: string }> = [
    {text: 'Electronic payment system', value: 'EPS'},
    {text: 'Bank card', value: 'BCX'},
    {text: 'Wire transfer', value: 'BTX'},
    {text: 'Cash', value: 'CSH'}
  ];
  public listTransferMethod: Array<{ text: string, value: string }> = [
    {text: 'In person', value: 'HANDS'},
    {text: 'Collect from warehouse', value: 'STORAGE'},
    {text: 'Deliver to buyer', value: 'DELIVERY'},
  ];


  /* currency */
  public settlementCurrencyValue;
  public settlementCurrencyValueDefault;
  public settlementMethodValue;
  public transferMethodValue;
  public offerDateValue;
  public offerDateValueDefault;
  public countryValue;
  public countryValueDefault;

  /* products */
  public productsOfferDateValue;
  public productsOfferDateValueDefault;
  public productsSettlementCurrencyValue;
  public productsSettlementCurrencyValueDefault;
  public productsCountryValue;
  public productsCountryValueDefault;
  public categoriesValue;
  public categoriesValueDefault;

  public settlementCurrencyChange() {
    this.filter_currency.p = this.settlementCurrencyValue.code;
    this.onChange();
  }

  public productsSettlementCurrencyChange() {
    this.filter_products.p = this.productsSettlementCurrencyValue.code;
    this.onChange();
  }

  public offerDateChange() {
    this.filter_currency.time = this.offerDateValue.value;
    this.onChange();
  }

  public productsOfferDateChange() {
    this.filter_products.time = this.productsOfferDateValue.value;
    this.onChange();
  }

  public countryChange() {
    this.filter_currency.lco = this.countryValue.alpha2Code;
    this.onChange();
  }

  public productsCountryChange() {
    this.filter_products.lco = this.productsCountryValue.alpha2Code;
    this.onChange();
  }

  public categoriesChange() {
    this.filter_products.cat = this.categoriesValue.id;
    this.onChange();
  }

  public settlementMethodChange(selectedValues: any): void {
    this.filter_currency.pt.EPS = false;
    this.filter_currency.pt.BCX = false;
    this.filter_currency.pt.BTX = false;
    this.filter_currency.pt.CSH = false;
    for (let i = 0; i < selectedValues.length; i++) {
      this.filter_currency.pt[selectedValues[i].value] = true;
    }
    this.onChange();
  }

  public transferMethodChange(selectedValues: any): void {
    this.filter_products.pt.HANDS = false;
    this.filter_products.pt.STORAGE = false;
    this.filter_products.pt.DELIVERY = false;
    for (let i = 0; i < selectedValues.length; i++) {
      this.filter_products.pt[selectedValues[i].value] = true;
    }
    this.onChange();
  }

  public settlementTagMapper(tags: any[]): any[] {
    const modTags = [];
    for (let i = 0; i < tags.length; i++) {
      if (i === tags.length - 1) {
        modTags.push(tags[i].text);
      } else {
        modTags.push(tags[i].text + ',');
      }
    }
    return modTags;
  }

  public transferTagMapper(tags: any[]): any[] {
    const modTags = [];
    for (let i = 0; i < tags.length; i++) {
      if (i === tags.length - 1) {
        modTags.push(tags[i].text);
      } else {
        modTags.push(tags[i].text + ',');
      }
    }
    return modTags;
  }

  categoriesMod() {
    this.categoriesSorted = [];
    for (let i = 0; i < this.categoriesOriginal.length; i++) {
      this.categoriesSorted.push({class: 'one', id: this.categoriesOriginal[i].id, title: this.categoriesOriginal[i].title});
      if (this.categoriesOriginal[i]['subcategories']) {
        for (let j = 0; j < this.categoriesOriginal[i]['subcategories'].length; j++) {
          this.categoriesSorted.push({
            class: 'two',
            id: this.categoriesOriginal[i]['subcategories'][j].id,
            title: this.categoriesOriginal[i]['subcategories'][j].title
          });
          if (this.categoriesOriginal[i]['subcategories'][j]['subcategories']) {
            for (let k = 0; k < this.categoriesOriginal[i]['subcategories'][j]['subcategories'].length; k++) {
              this.categoriesSorted.push({
                class: 'three',
                id: this.categoriesOriginal[i]['subcategories'][j]['subcategories'][k].id,
                title: this.categoriesOriginal[i]['subcategories'][j]['subcategories'][k].title
              });
            }
          }
        }
      }
    }
  }

  dateChanged() {
    const year = this.date.getFullYear();
    const month = this.date.getMonth() + 1;
    const date = this.date.getDate();
    return year + '-' + ((month < 10) ? '0' : '') + month + '-' + ((date < 10) ? '0' : '') + date;
  }


  @HostListener('document:click', ['$event']) onClick(event: any) {
    if (event.target && event.target.className && event.target.className.indexOf('air-input') === -1) {
      if (event.target.className.indexOf('-other-month-') > -1) {
        return;
      }
      const target = event.target.closest('air-datepicker');

      if (target === null) {
        const air = document.querySelector('air-datepicker');
        if (air !== null) {
          if (this.currency_from) {
            this.currency_from = false;
          }
          if (this.currency_to) {
            this.currency_to = false;
          }
          if (this.products_from) {
            this.products_from = false;
          }
          if (this.products_to) {
            this.products_to = false;
          }
        }
      } else {
        if (this.currency_from === true) {
          this.currency_from = false;
        }
        if (this.currency_to === true) {
          this.currency_to = false;
        }
        if (this.products_from === true) {
          this.products_from = false;
        }
        if (this.products_to === true) {
          this.products_to = false;
        }
      }
    }
  }


  constructor(
    private httpService: HttpService,
    private _cookieService: CookieService,
    private mobileNavState: MobileNavState) {
    this.maxCount = 1000;
    this.visiblePagination = false;
    this.activeClass = 'currency';
    this.CurrencyFilter = false;
    this.ProductsFilter = false;
    this.currentSortingDirection = false;
    this.currentSortingField = 'timestamp';
    this.selectionText = '';
    this.highlightedText = false;
    this.filter_currency = {
      keyword: '',
      ot: 5,
      p: '',
      pt: {
        EPS: false,
        BCX: false,
        BTX: false,
        CSH: false
      },
      time: 'any',
      time_start: '',
      time_end: '',
      location: 'country',
      lco: '',
      lci: '',
      ap_from: '',
      ap_to: '',
      rate_from: '',
      rate_to: ''
    };
    this.filter_products = {
      keyword: '',
      keyword_only_title: false,
      ot: 4,
      cat: '',
      p: '',
      pt: {
        HANDS: false,
        STORAGE: false,
        DELIVERY: false
      },
      time: 'any',
      time_start: '',
      time_end: '',
      location: 'country',
      lco: '',
      lci: '',
      ap_from: '',
      ap_to: '',
    };
    this.appSearchShow = true;
    this.loader = false;
    this.navIsOpen = false;
    this.settlementCurrencyValueDefault = {'code': '', 'title': 'all'};
    this.settlementCurrencyValue = this.settlementCurrencyValueDefault;
    this.offerDateValueDefault = {'text': 'any', 'value': 'any'};
    this.offerDateValue = this.offerDateValueDefault;
    this.countryValueDefault = {'name': 'all', 'alpha2Code': ''};
    this.countryValue = this.countryValueDefault;
    this.categoriesValueDefault = {'title': 'all', 'id': ''};
    this.categoriesValue = this.categoriesValueDefault;
    this.productsOfferDateValueDefault = {'text': 'any', 'value': 'any'};
    this.productsOfferDateValue = this.productsOfferDateValueDefault;
    this.productsSettlementCurrencyValueDefault = {'code': '', 'title': 'all'};
    this.productsSettlementCurrencyValue = this.productsSettlementCurrencyValueDefault;
    this.productsCountryValueDefault = {'name': 'all', 'alpha2Code': ''};
    this.productsCountryValue = this.productsCountryValueDefault;
  }


  ngOnInit() {
    this.currentPage = 1;
    this.count = 20;
    this.offset = 0;
    if (this._cookieService.get('setCountOffersCookie')) {
      this.count = parseInt(this._cookieService.get('setCountOffersCookie'), 10);
    }
    if (this._cookieService.get('setSectionCookie')) {
      this.activeClass = this._cookieService.get('setSectionCookie');
    }
    this.categoriesMod();
    this.onChange();
    this.mobileNavState.change.subscribe(navIsOpen => {
      this.navIsOpen = navIsOpen;
    });
  }

  multiselectChange(event) {
    event.preventDefault();
    const input = event.target.childNodes[1].childNodes[0];
    input.readOnly = 'readonly';
    input.setAttribute('readonly', 'readonly');
    input.addEventListener('focus', () => input.blur(), true);
  }

  onChange() {
    this.loader = true;
    if (this.count > this.maxCount) {
      this.count = this.maxCount;
    }
    if (!this.count) {
      this.count = 20;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    this.limitList = +this.count;
    this._cookieService.put('setCountOffersCookie', this.limitList);

    this.offset = (this.currentPage - 1) * this.count;
    if (this.getOffersSubscription) {
      this.getOffersSubscription.unsubscribe();
    }

    if (this.activeClass === 'currency') {
      this.getOffersSubscription = this.httpService.getOffersCurrency(this.activeClass, this.offset, this.count, this.currentSortingField, this.currentSortingDirection, this.filter_currency.keyword, this.filter_currency.ot, this.filter_currency.p, this.filter_currency.pt, this.filter_currency.time, this.filter_currency.time_start, this.filter_currency.time_end, this.filter_currency.location, this.filter_currency.lco, this.filter_currency.lci, this.filter_currency.ap_from, this.filter_currency.ap_to, this.filter_currency.rate_from, this.filter_currency.rate_to).subscribe(
        data => {
          this.Offers = (data) ? data : [];
          for (let i = 0; i < this.Offers.length; i++) {
            try {
              this.Offers[i].cnt = JSON.parse(this.Offers[i].cnt);
              this.Offers[i].pt = JSON.parse(this.Offers[i].pt);
            } catch (e) {
              this.Offers[i].cnt = null;
              this.Offers[i].pt = null;
            }
          }
          if (this.Offers.length) {
            this.lengthOffers = this.Offers.length;
          } else {
            this.lengthOffers = 0;
          }
        }, err => {
          console.log('getOffers', err);
        },
        () => {
          this.loader = false;
          this.visiblePagination = true;
        }
      );
    } else {
      this.getOffersSubscription = this.httpService.getOffersProducts(this.activeClass, this.offset, this.count, this.currentSortingField, this.currentSortingDirection, this.filter_products.keyword, this.filter_products.keyword_only_title, this.filter_products.ot, this.filter_products.cat, this.filter_products.time, this.filter_products.time_start, this.filter_products.time_end, this.filter_products.p, this.filter_products.pt, this.filter_products.location, this.filter_products.lco, this.filter_products.lci, this.filter_products.ap_from, this.filter_products.ap_to).subscribe(
        data => {
          this.Offers = (data) ? data : [];
          for (let i = 0; i < this.Offers.length; i++) {
            try {
              this.Offers[i].cnt = JSON.parse(this.Offers[i].cnt);
              this.Offers[i].pt = JSON.parse(this.Offers[i].pt);
            } catch (e) {
              this.Offers[i].cnt = null;
              this.Offers[i].pt = null;
            }
          }
          if (this.Offers.length) {
            this.lengthOffers = this.Offers.length;
          } else {
            this.lengthOffers = 0;
          }
        }, err => {
          console.log('getOffers', err);
        },
        () => {
          this.loader = false;
          this.visiblePagination = true;
        }
      );
    }
  }

  marketSearch(event) {
    if (event) {
      const target = event.target;
      const parent = target.parentElement;
      if (this.activeClass === 'currency') {
        if (target.id === 'btn_currency_search') {
          if (!this.filter_currency.keyword.length) {
            parent.classList.toggle('show');
            parent.parentNode.classList.toggle('show');
          }
        }
      }
      if (this.activeClass === 'products') {
        if (target.id === 'btn_products_search') {
          if (!this.filter_products.keyword.length) {
            parent.classList.toggle('show');
            parent.parentNode.classList.toggle('show');
            parent.parentNode.parentNode.parentNode.parentNode.classList.toggle('show');
          }
        }
      }
      this.appSearchShow = !parent.classList.contains('show');
    }
  }

  filter() {
    this.currentPage = 1;
    this.count = 20;
    this.onChange();
  }


  sorting(value) {
    this.currentSortingField = value;
    if (this.currentSortingField === value) {
      this.currentSortingDirection = !this.currentSortingDirection;
    } else {
      this.currentSortingDirection = true;
    }
    this.onChange();
  }

  getCurrency(event) {
    const goCurrencyTarget = event.target.parentElement;
    goCurrencyTarget.parentNode.parentNode.parentNode.classList.remove('show');

    this.activeClass = 'currency';
    this._cookieService.put('setSectionCookie', this.activeClass);
    this.currentPage = 1;
    this.currentSortingField = 'timestamp';
    this.currentSortingDirection = false;
    this.filter_products.keyword = '';
    this.onChange();
  }

  getProducts() {
    this.activeClass = 'products';
    this._cookieService.put('setSectionCookie', this.activeClass);
    this.currentPage = 1;
    this.currentSortingField = 'timestamp';
    this.currentSortingDirection = false;
    this.filter_currency.keyword = '';
    this.onChange();
  }

  itemOnPageChange() {
    this.currentPage = 1;
    this.onChange();
  }

  nextPage() {
    if (this.Offers.length >= +this.count) {
      this.currentPage++;
      this.onChange();
    }
  }

  prevPage() {
    if ((this.currentPage - 1) > 0) {
      this.currentPage--;
      this.onChange();
    }
  }

  selectText() {
    if (window.getSelection) {
      this.selectionText = window.getSelection().toString();
    }
    this.selectionText.replace(/\s/g, '') === '' ? this.highlightedText = false : this.highlightedText = true;
  }

  public setOffer = (offer) => {
    window.location.hash = '#modalOpen';
    this.currentOffer = offer;
  };


  openCurrencyFilter() {
    this.CurrencyFilter = !this.CurrencyFilter;
    setTimeout(function () {
      (document.getElementsByTagName('kendo-searchbar')[0].childNodes[0] as HTMLElement).addEventListener('focus', () =>
        (document.getElementsByTagName('kendo-searchbar')[0].childNodes[0] as HTMLElement).blur(), true);
    }, 2000);
  }

  openProductsFilter() {
    this.ProductsFilter = !this.ProductsFilter;
    setTimeout(function () {
      (document.getElementsByTagName('kendo-searchbar')[0].childNodes[0] as HTMLElement).addEventListener('focus', () =>
        (document.getElementsByTagName('kendo-searchbar')[0].childNodes[0] as HTMLElement).blur(), true);
    }, 2000);
  }

  clearCurrencyFilter() {
    this.filter_currency = {
      keyword: '',
      ot: 5,
      p: '',
      pt: {
        EPS: false,
        BCX: false,
        BTX: false,
        CSH: false
      },
      time: 'any',
      time_start: '',
      time_end: '',
      location: 'country',
      lco: '',
      lci: '',
      ap_from: '',
      ap_to: '',
      rate_from: '',
      rate_to: ''
    };
    this.settlementCurrencyValue = this.settlementCurrencyValueDefault;
    this.settlementMethodValue = [];
    this.offerDateValue = this.offerDateValueDefault;
    this.countryValue = this.countryValueDefault;
    this.onChange();
  }

  clearProductsFilter() {
    this.filter_products = {
      keyword: '',
      keyword_only_title: false,
      ot: 4,
      cat: '',
      p: '',
      pt: {
        HANDS: false,
        STORAGE: false,
        DELIVERY: false
      },
      time: 'any',
      time_start: '',
      time_end: '',
      location: 'country',
      lco: '',
      lci: '',
      ap_from: '',
      ap_to: '',
    };
    this.transferMethodValue = [];
    this.productsOfferDateValue = this.productsOfferDateValueDefault;
    this.productsSettlementCurrencyValue = this.productsSettlementCurrencyValueDefault;
    this.productsCountryValue = this.productsCountryValueDefault;
    this.categoriesValue = this.categoriesValueDefault;
    this.onChange();
  }

  ngOnDestroy() {
    if (this.getOffersSubscription) {
      this.getOffersSubscription.unsubscribe();
    }
  }

}





