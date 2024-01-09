import { Header } from "../components/Header";
import { firebaseFunction } from "../network/firebase/init";
import { changeCompanies } from "../state/context";
import { AsyncButton } from "../components/AsyncButton";
import { useAppForm } from "../utils/form";
import { FormTextField } from "../components/AppTextField";

export const CreateCompanyContainer = () => {
  const fm = useAppForm<{ name: string }>({ focus: "name" });
  const submit = fm.handleSubmit(async ({ name }) => {
    const data = await firebaseFunction("createCompany", { name });
    changeCompanies(data.companyId);
  });
  return (
    <Header header="Create a company">
      <form>
        <FormTextField label="Company Name" fullWidth form={fm} name="name" />
        <AsyncButton type="submit" onClick={submit}>
          Submit
        </AsyncButton>
      </form>
    </Header>
  );
};
