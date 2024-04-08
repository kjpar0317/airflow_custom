interface IInputFiled {
  id: string;
  title: string;
  register: any;
  [key: string]: any;
}

export default function InputField({
  id,
  title,
  register,
  ...rest
}: Readonly<IInputFiled>) {
  return (
    <>
      <span className="bg-primary w-28 font-bold text-xs text-center text-primary-content p-1 px-1 rounded-l">
        {title}
      </span>
      <input
        id={id}
        className="field text-sm text-base-content p-2 px-3 rounded-r w-11/12 border-primary border-2 mr-2"
        type="text"
        {...register}
        {...rest}
      />
    </>
  );
}
