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
        className="h-10 rounded-none bg-background"
      />
    </div>
  );
}

export function SelectInput({ label, name, options }: SelectInputProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Select name={name} defaultValue={toOptionValue(options[0])}>
        <SelectTrigger
          id={name}
          className="h-10 w-full rounded-none bg-background"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={toOptionValue(option)}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function toOptionValue(option: string) {
  return option.toLowerCase().replaceAll(" ", "-");
}
