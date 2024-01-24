import { ChangeEvent } from "react";

export const PlainView = ({
  onChange,
  value,
}: {
  onChange: (e: ChangeEvent<HTMLTextAreaElement>, v: string) => void;
  value: string;
}) => {
  return (
    <div className="full-size border">
      <textarea
        value={value}
        onChange={(e) => {
          onChange(e, e.target.value || "");
        }}
      />
    </div>
  );
};
