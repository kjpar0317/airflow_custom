import { cn } from "@/util/comm_util";

interface IInputFiled {
  title: string;
  register?: any;
  className?: string;
  [key: string]: any;
}

export default function InputField({
  title,
  register,
  className = "",
  ...rest
}: Readonly<IInputFiled>) {
  return (
    <>
      <span
        className={cn(
          "w-28 font-bold text-xs text-center p-1 px-1 rounded-l",
          `bg-primary text-primary-content`
        )}
      >
        {title}
      </span>
      {(register && (
        <input
          className={cn(
            "field text-sm text-base-content p-2 px-3 rounded-r w-11/12 border-2 mr-2",
            className !== "" ? className : "border-primary"
          )}
          type="text"
          {...register}
          {...rest}
        />
      )) || (
        <input
          className={cn(
            "field text-sm text-base-content p-2 px-3 rounded-r w-11/12 border-2 mr-2",
            className !== "" ? className : "border-primary"
          )}
          type="text"
          {...rest}
        />
      )}
    </>
  );
}
