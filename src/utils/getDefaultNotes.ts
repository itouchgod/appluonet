export function getDefaultNotes(salesPerson: string, type: 'quotation' | 'confirmation'): string[] {
  if (salesPerson === 'Sharon' && type === 'quotation') {
    return [
      'Delivery time: 30 days',
      'Price based on EXW-Jiangsu, China',
      'Delivery terms: As mentioned above,subj to unsold',
      'Excluding handling & packing charge and freight cost',
      'Payment term: 30 days',
      'Validity: 10 days',
    ];
  }
  
  return type === 'quotation'
    ? [
        'Delivery time: 30 days',
        'Price based on EXW-Shanghai, China',
        'Delivery terms: As mentioned above, subj to unsold',
        'Payment term: 50% deposit, the balance paid before delivery',
        'Validity: 10 days',
      ]
    : [
        'Price based on EXW-Shanghai',
        'Delivery terms: As mentioned above, subj to unsold',
        'Payment term: 100% TT in advance',
      ];
} 