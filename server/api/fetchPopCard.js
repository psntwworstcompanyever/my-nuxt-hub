export default defineEventHandler( async(event) => {

    return [
        {
          $el: 'h2',
          id: 'title',
          children: ['Note']
        },
        {
          $cmp: 'FormKit',
          props: {
              name: 'pop_specification',
              type: 'text',
              id: "pop_specification",
              label: 'Specification:',
              disabled: true
          }
        },
        {
          $cmp: 'FormKit',
          props: {
              name: 'pop_illustration',
              type: 'text',
              id: "pop_illustration",
              label: 'Illustration:',
              disabled: true
          }
        },
        {
          $cmp: 'FormKit',
          props: {
              name: 'pop_selected_item',
              type: 'text',
              id: "pop_selected_item",
              label: 'Selected Item:',
              disabled: true
          }
        },
        {
          $cmp: 'FormKit',
          props: {
              name: 'pop_customer',
              type: 'text',
              id: "pop_customer",
              label: 'Customer:',
              disabled: true
          }
        },
        {
          $cmp: 'FormKit',
          props: {
              name: 'pop_customer_setting',
              type: 'text',
              id: "pop_customer_setting",
              label: 'Customer Setting:',
              disabled: true
          }
        },
        {
          $cmp: 'FormKit',
          props: {
              name: 'pop_recommendation',
              type: 'text',
              id: "pop_recommendation",
              label: 'Recommendation:',
              disabled: true
          }
        }
      ]
})
