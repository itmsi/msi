import ManageCustomers from "@/pages/Administration/Customers/Manage";

export default function Manage() {
    return <ManageCustomers 
        action={false} 
        urlPath="/crm/customer/dashboard/" 
        titlePage="Customer 360° Overview"
        descPage="Access detailed customer information, interactions, and history to build stronger relationships."
    />;
}