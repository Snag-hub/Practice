import {
  useCreateProductMutation,
  useFetchProductsQuery,
} from "../api/productsApi";

const ItemList = () => {
  const { data: employees, error, isLoading } = useFetchProductsQuery({});

  console.log(employees);

  const [createProduct] = useCreateProductMutation();

  const handleAddProduct = async () => {
    await createProduct({ name: "New Product", price: 100 });
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading employees</p>;

  return (
    <div>
      <h1>Product List</h1>
      <button onClick={handleAddProduct}>Add Product</button>
      <ul>
        {employees?.map(
          (employee: { EmpId: number; EmpName: string; Address: string }) => (
            <li key={employee.EmpId}>
              {employee.EmpName} - {employee.Address}
            </li>
          )
        )}
      </ul>
    </div>
  );
};
export default ItemList;
