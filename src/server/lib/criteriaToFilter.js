import usageRangeOptions from "../../shared/constants/usageRanges.js";

export default function criteriaToFilterExpression(criteria, userId = null) 
{
    const { tone, usage } = criteria;
    const range = usage ? usageRangeOptions.find(({ value }) => value === usage) : null;

    let expressions = [];
    let values = {};
    let names = {};

    if( userId ) {
      expressions.push('userId = :userId');
      values[':userId'] = { S: userId }
    }

    if (tone) {
      expressions.push('#tone = :tone');
      values[':tone'] = { S: tone };
      names['#tone'] = 'tone';
    }
    
    if (range) {
      expressions.push('#usage BETWEEN :lo AND :hi');
      values[':lo'] = { N: String(range.lo) };
      values[':hi'] = { N: String(range.hi) };
      names['#usage'] = 'usage';
    }

    if( !expressions.length ) {
      return null;
    }

    return {
      expression: expressions.join(' AND '),
      values,
      names: Object.keys(names).length ? names : undefined
    };
}