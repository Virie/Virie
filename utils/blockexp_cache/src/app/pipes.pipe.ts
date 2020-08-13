import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';

// array reverse
@Pipe({
  name: 'orderBy',
  pure: false
})
export class OrderByPipe implements PipeTransform {
  transform(array: any[], field: any): any[] {
    if (!array) {
      return array;
    }
    array.reverse();
    return array;
  }
}

// sort
@Pipe({
  name: 'sortgrid',
  pure: false
})
export class SortGridPipe implements PipeTransform {
  transform(array: Array<any>, args?: any): Array<any> {
    if (typeof args[0] === 'undefined') {
      return array;
    }
    const direction = args[0][0];
    const column = args.replace('-', '');
    array.sort((a: any, b: any) => {
      const left = Number(new Date(a[column]));
      const right = Number(new Date(b[column]));
      return (direction === '-') ? right - left : left - right;
    });
    return array;
  }
}

@Pipe({
  name: 'sortByAlphabet'
})
export class SortByAlphabetPipe implements PipeTransform {
  transform(array: any[], field: string): any[] {
    array.sort((a: any, b: any) => {
      if (a[field] < b[field]) {
        return -1;
      } else if (a[field] > b[field]) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }
}

// bit number format
@Pipe({
  name: 'bitNumber',
  pure: false
})
export class BitNumberPipe implements PipeTransform {
  transform(value: any) {
    if (isNaN(value)) {
      return String(value);
    }
    if (value === null) {
      return value;
    }
    const string = value.toString();
    const arr = string.split('.');
    arr[0] = arr[0].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');
    return arr.join(',');
  }
}

// money number format
@Pipe({
  name: 'moneyParse',
  pure: false
})
export class MoneyParsePipe implements PipeTransform {
  transform(money: any) {
    const decimal = 8;
    if (typeof money === 'string') {
      money = Number(money);
    }
    const power = Math.pow(10, decimal);
    const num: number = money / power;

    function isInteger(numberTest) {
      return (numberTest ^ 0) === numberTest;
    }

    if (isInteger(num) === true) { // 11.00000000 -> 11.0; 0 -> 0
      if (num === 0) {
        return num;
      } else {
        const addDecimal = num.toFixed(1);
        return addDecimal;
      }
    } else {
      return num;
    }
  }
}

@Pipe({
  name: 'limitTo'
})
export class TruncatePipe implements PipeTransform {
  transform(value: any, limit: number): any {
    if (value) {
      return value.slice(0, limit);
    }
  }
}


// Long Time Ago
@Pipe({
  name: 'TimeAgo',
  pure: false
})
export class TimeAgoPipe implements PipeTransform {
  result: any;

  transform(value: any): any {
    const now = moment(value);

    let utcMoment = moment.utc();
    let date = new Date(utcMoment.format());
    const exp = moment(date);
    const diffDuration = moment.duration(exp.diff(now));

    if ((diffDuration.days() === 0) && (diffDuration.hours() === 0) && (diffDuration.minutes() === 0)) {
      this.result = 'a few seconds';
    } else if ((diffDuration.days() === 0) && (diffDuration.hours() === 0)) {
      this.result = diffDuration.minutes() + 'm ';
    } else if (diffDuration.days() === 0) {
      this.result = diffDuration.hours() + 'h ' + diffDuration.minutes() + 'm ';
    } else {
      this.result = diffDuration.days() + 'd ' + diffDuration.hours() + 'h ' + diffDuration.minutes() + 'm ';
    }
    return this.result;
  }
}


@Pipe({
  name: 'Order',
  pure: false
})
export class OrderPipe implements PipeTransform {

  static _OrderPipeComparator(a: any, b: any): number {

    if ((isNaN(parseFloat(a)) || !isFinite(a)) || (isNaN(parseFloat(b)) || !isFinite(b))) {
      if (a.toLowerCase() < b.toLowerCase()) {
        return -1;
      }
      if (a.toLowerCase() > b.toLowerCase()) {
        return 1;
      }
    } else {
      if (parseFloat(a) < parseFloat(b)) {
        return -1;
      }
      if (parseFloat(a) > parseFloat(b)) {
        return 1;
      }
    }

    return 0;
  }

  transform(input: any, [config = '+']): any {

    if (!Array.isArray(input)) {
      return input;
    }

    if (!Array.isArray(config) || (Array.isArray(config) && config.length === 1)) {
      const propertyToCheck: string = !Array.isArray(config) ? config : config[0];
      const desc = propertyToCheck.substr(0, 1) === '-';

      if (!propertyToCheck || propertyToCheck === '-' || propertyToCheck === '+') {
        return !desc ? input.sort() : input.sort().reverse();
      } else {
        const property: string = propertyToCheck.substr(0, 1) === '+' || propertyToCheck.substr(0, 1) === '-'
          ? propertyToCheck.substr(1)
          : propertyToCheck;

        return input.sort(function (a: any, b: any) {
          return !desc
            ? OrderPipe._OrderPipeComparator(a[property], b[property])
            : -OrderPipe._OrderPipeComparator(a[property], b[property]);
        });
      }
    } else {

      return input.sort(function (a: any, b: any) {
        for (let i: any = 0; i < config.length; i++) {
          const desc = config[i].substr(0, 1) === '-';
          const property = config[i].substr(0, 1) === '+' || config[i].substr(0, 1) === '-'
            ? config[i].substr(1)
            : config[i];

          const comparison = !desc
            ? OrderPipe._OrderPipeComparator(a[property], b[property])
            : -OrderPipe._OrderPipeComparator(a[property], b[property]);

          if (comparison !== 0) {
            return comparison;
          }
        }

        return 0;
      });
    }
  }
}


@Pipe({
  name: 'Category',
})
export class CategoryPipe implements PipeTransform {
  transform(value: any): any {
    const arrCat = value.split(',');
    for (let i = 0; i < arrCat.length; i++) {
      arrCat[i] = categoriesOriginal[arrCat[i]];
    }
    return arrCat.join(' > ');
  }
}


const categoriesOriginal = {
  'AAA': 'Cryptocurrency',
  'AAB': 'Buying and selling cryptocurrency',
  'AAC': 'Mining Hardware',
  'AAD': 'Other',
  'BAA': 'Information and databases',
  'CAA': 'Software',
  'DAA': 'Books and magazines',
  'EAA': 'Gift coupons, certificates, and pre-paid cards',
  'FAA': 'Precious metals, gems, and jewelry',
  'GAA': 'Documentation',
  'HAA': 'Audio/video recordings',
  'IAA': 'Electronics',
  'IAB': 'Audio/video',
  'IAC': 'Video games and game consoles',
  'IAD': 'Desktop computers',
  'IAE': 'Laptops',
  'IAF': 'Office equipment and supplies',
  'IAG': 'Tablets and ebooks',
  'IAH': 'Phones',
  'IAI': 'Means of communication and the transmission of information',
  'IAK': 'Photography',
  'IAL': 'Other',
  'JAA': 'Hobbies and leisure',
  'JAB': 'Tickets and travel',
  'JAC': 'Collecting',
  'JAD': 'Musical instruments',
  'JAE': 'Hunting and fishing',
  'JAF': 'Sports and recreation, tourism',
  'JAG': 'Other',
  'KAA': 'Security',
  'LAA': 'Plants and animals',
  'MAA': 'Medicine and pharmaceuticals',
  'NAA': 'Chemistry',
  'NAB': 'Chemical agents',
  'NAC': 'Equipment',
  'NAD': 'Other',
  'OAA': 'For business',
  'OAB': 'Existing business',
  'OAC': 'Business equipment',
  'OAD': 'Other',
  'PAA': 'For households',
  'PAB': 'Antiques',
  'PAC': 'Small electronics',
  'PAD': 'Furniture and interior decorating',
  'PAE': 'Dishes and kitchen products',
  'PAF': 'Repair and construction',
  'PAG': 'Other',
  'QAA': 'Groceries',
  'RAA': 'Personal items',
  'RAB': 'Clothing, footwear, and accessories',
  'RAC': 'Beauty, cosmetics, and perfume/cologne',
  'RAD': 'Devices and accessories',
  'RAE': 'Other',
  'SAA': 'Real estate',
  'SAB': 'Apartments/condominiums',
  'SAC': 'Houses, cabins, cottages, and villas',
  'SAD': 'Agricultural plots',
  'SAF': 'Commercial real estate',
  'SAG': 'Other',
  'TAA': 'Vehicles',
  'TAB': 'Cars',
  'TAC': 'Trucks',
  'TAD': 'Special equipment',
  'TAE': 'Motorcycles',
  'TAF': 'Buses and minibuses',
  'TAG': 'Watercraft',
  'TAH': 'Aircraft',
  'TAI': 'Parts and accessories',
  'TAJ': 'Other',
  'UAA': 'Services',
  'UAB': 'IT/internet',
  'UBL': 'Software/network rental',
  'UBM': 'Information search',
  'UBN': 'Software installation and configuration',
  'UBO': 'Software development',
  'UBP': 'Software testing',
  'UBQ': 'Website creation',
  'UBR': 'Marketing, advertising, and PR',
  'UBS': 'Design',
  'UBT': 'Newsletters',
  'UBU': 'Other',
  'UAC': 'Financial services',
  'UBV': 'Underwriters',
  'UBW': 'Aggregators and payment processin',
  'UBX': 'Cash and non-cash transactions',
  'UBY': 'Currency exchange',
  'UBZ': 'Loans and credit',
  'UCA': 'Investments',
  'UCB': 'Marketplaces and auctions',
  'UCC': 'Other',
  'UAD': 'Cryptocurrencies',
  'UCD': 'Exchanges and exchangers',
  'UCE': 'Aggregators and payment processing',
  'UCF': 'Pools',
  'UCG': 'Other',
  'UVE': 'Transport',
  'UAF': 'Task completion',
  'UAG': 'Sports',
  'UAH': 'Auto repair',
  'UAI': 'Vehicle rental',
  'UAJ': 'Domestic services',
  'UAK': 'Business services',
  'UAL': 'Art',
  'UAM': 'Beauty, health, and spa',
  'UAN': 'Courier deliveries',
  'UAO': 'Consulting',
  'UAP': 'Writing and proofreading services',
  'UAQ': 'Medical services',
  'UAR': 'Equipment and manufacturing',
  'UAS': 'Training and courses',
  'UAT': 'Security and protection',
  'UAU': 'Hotels and accommodations',
  'UAV': 'Information search',
  'UAW': 'Food and catering',
  'UAX': 'Holidays and events',
  'UAY': 'Translation',
  'UAZ': 'Entertainment and events',
  'UBA': 'Advertising and printing',
  'UBB': 'Equipment repair',
  'UBC': 'Construction and repair',
  'UBD': 'Gardening and landscaping',
  'UBE': 'Insurance',
  'UBF': 'Tourism and guided tours',
  'UBG': 'Cleaning',
  'UBH': 'Equipment installation',
  'UBI': 'Photography and video recording',
  'UBJ': 'Legal services',
  'UBK': 'Other',
  'VAA': 'Other',
  'WAA': 'Donation and crowdfunding'
};


@Pipe({
  name: 'Lang',
})
export class LangPipe implements PipeTransform {
  transform(value: any): any {
    for (let i = 0; i < langList.length; i++) {
      if (value === langList[i].alpha2Code) {
        value = langList[i].name;
      }
    }
    return value;
  }
}

const langList = [
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


@Pipe({
  name: 'hashRateConverter'
})
export class HashRateConverterPipe implements PipeTransform {

  transform(value: number): any {
    const KH = 1000;
    const MH = 1000000;
    const GH = 1000000000;
    const TH = 1000000000000;
    const PT = 1000000000000000;

    if (value && !isNaN(value)) {
      if (value >= PT) {
        return (value / PT).toFixed(3) + ' PT/s';
      } else if (value >= TH) {
        return (value / TH).toFixed(3) + ' TH/s';
      } else if (value >= GH) {
        return (value / GH).toFixed(3) + ' GH/s';
      } else if (value >= MH) {
        return (value / MH).toFixed(3) + ' MH/s';
      } else if (value >= KH) {
        return (value / KH).toFixed(3) + ' KH/s';
      } else {
        return value + ' H/s';
      }
    } else if (value === 0) {
      return value + ' H/s';
    }
  }
}
