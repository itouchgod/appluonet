export function getDefaultNotes(salesPerson: string, type: 'quotation' | 'confirmation'): string[] {
  if (salesPerson === 'Sharon' && type === 'quotation') {
    return [
      'Price based on EXW-JIANG SU, CHINA.',
      'Delivery terms: as mentioned above,subj to unsold',
      'Excluding handling & packing charge and freight cost',
      'Payment term: 30 days',
      'Validity: 20 days',
    ];
  }
  
  return type === 'quotation'
    ? [
        'Delivery time: 30 days',
        'Price based on EXW-Shanghai, Mill TC',
        'Delivery terms: as mentioned above, subj to unsold',
        'Payment term: 50% deposit, the balance paid before delivery',
        'Validity: 5 days',
      ]
    : [
        'Order confirmed',
        'Delivery time: 30 days after payment received',
        'Payment term: 50% deposit, the balance paid before delivery',
        'Shipping term: EXW-Shanghai'
      ];
} 