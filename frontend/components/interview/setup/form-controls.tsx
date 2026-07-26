import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TextInputProps = {
  label: string;
  name: string;
  placeholder: string;
};

type SelectInputProps = {
  label: string;
  name: string;
  options: string[];
};

export function TextInput({ label, name, placeholder }: TextInputProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type="text"
        name={name}
        placeholder={placeholder}
        className="h-12 rounded-sm border-black/10 bg-[#f7f5ef] px-4 text-sm"
      />
    </div>
  );
}

export function SelectInput({ label, name, options }: SelectInputProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Select name={name} defaultValue={options[0]}>
        <SelectTrigger
          id={name}
          className="h-12 w-full rounded-sm border-black/10 bg-[#f7f5ef] px-4 text-sm"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
