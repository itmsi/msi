import ManageCustomers from "@/pages/Administration/Customers/Manage";

export default function Manage() {
    return <ManageCustomers action={false} urlPath="/crm/customer/dashboard/" />;
}