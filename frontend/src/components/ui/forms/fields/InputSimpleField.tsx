import { cn } from "@/util/comm_util";

interface IInputSimpleFiled {
  id: string;
  title: string;
  register?: any;
  className?: string;
  [key: string]: any;
}

export default function InputSimpleField({
  id,
  title,
  register,
  className = "",
  ...rest
}: Readonly<IInputSimpleFiled>) {
  return (
    <>
      <label
        htmlFor={id}
        className="block mb-1 mt-1 text-sm font-medium text-base-content"
      >
        {title}
      </label>
      {(register && (
        <input
          type="text"
          id={id}
          className={cn(
            "input w-full p-2.5 input-sm",
            className ?? "input-primary"
          )}
          {...register}
          {...rest}
        />
      )) || (
        <input
          type="text"
          id={id}
          className={cn(
            "input w-full p-2.5 input-sm",
            className ?? "input-primary"
          )}
          {...rest}
        />
      )}
    </>
  );
}
