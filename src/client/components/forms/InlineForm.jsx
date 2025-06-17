
const EditInput = ({value, id, placeholder}) => <input  id={id || ''} value={value} placeholder={placeholder || ''} className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" type="text" />
const Password = ({value,id}) => <input id={id || ''} value={value} className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" type="password" placeholder="******************" /> 
const Label = ({text, forField}) => <div className="md:w-1/3">
      <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" for={forField || ''}>
        {text}
    </label></div>;

const fields = [
    { label: 'foo',
      Type: EditInput,
      value: 'My value',
      id: 'foo'
    }
]
const InlineForm = ({fields, buttonText, onCancel, onSubmit}) => {
    return <form className="w-full max-w-sm">
        {   fields.map(Field => {
                return <div className="md:flex md:items-center mb-6">
                    <div className="md:w-1/3">
                        <Label text={Field.label} forField={Field.id} />
                    </div>
                    <div className="md:w-2/3">
                        <Field.Type value={Field.value} id={Field.id} placeholder={Field.placeholder || ''} />
                    </div>
                </div>
            })
        }

  <div className="md:flex md:items-center mb-6">
    <div className="md:w-1/3"></div>
    <label className="md:w-2/3 block text-gray-500 font-bold">
      <input className="mr-2 leading-tight" type="checkbox" />
      <span className="text-sm">
        Send me your newsletter!
      </span>
    </label>
  </div>
  <div className="md:flex md:items-center">
    <div className="md:w-1/3"></div>
    <div className="md:w-2/3">
      <button className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" type="button">
        Sign Up
      </button>
    </div>
  </div>
</form>

}