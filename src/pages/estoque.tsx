import { Form, Modal, Page, Sidebar, StockHeader } from "@/components";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/types/products";
import { useEffect, useState } from "react";
import { ProductType } from '@/types/productType';
import { Field } from '@/types/field';

export default function Estoque() {
  const [products, setProducts] = useState<Product[] | null>();
  const [productType, setProductType] = useState<ProductType[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [modalState, setModalState] = useState<{ isOpen: boolean; onSubmit: (() => void) | null }>({ isOpen: false, onSubmit: null });

  const openModal = (callback: () => void) => {
    setModalState({ isOpen: true, onSubmit: callback });
  };
  

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const fetchProducts = async () => {
    const data = await fetch(
      "https://villadomarapi.azurewebsites.net/api/Products/GetProductsWithAmount"
    );
    const response = await data.json();

    return response;
  };

  const fetchProductType = async () => {
    const data = await fetch(
      "https://villadomarapi.azurewebsites.net/api/TypeProduct/GetTypeProducts"
    );
    const response = await data.json();

    return response;
  }

  useEffect(() => {
    let ignore = false;
    setProducts(null);
    fetchProducts().then((result) => {
      if (!ignore) {
        setProducts(result);
      }
    });
    fetchProductType().then((result) => {
      if(!ignore){
        setProductType(result);
      }
    })
    return () => {
      ignore = true;
    };
  }, []);

  const fields: Field[] = [
    { name: 'Nome', type: 'text', className: 'text-red' },
    { name: 'Valor', type: 'number' },
    { name: 'Descrição', type: 'text' },
    { name: 'Peso', type: 'number' },
    { name: 'Tipo', type: 'select', values: productType },
  ];

  const handleSubmit = () => { 
    var name = (document.getElementById("name") as HTMLInputElement);
    var desc = (document.getElementById("description") as HTMLInputElement);

    const data = {
      name: name.value,
      description: desc.value
    };

    fetch(
      "https://villadomarapi.azurewebsites.net/api/Products/InsertProduct",
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      }
    )
      .then((response) => response.json())
      .then(() => {
        name.value = "";
        desc.value = "";
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Delete do produto 
  // sera q seria melhor colocar em outros arquivos ou deixar aqui ta suave?
  const handleDelete = async (productId: number) => {
    try {
      // n sei se tem link pra deletar 
      const response = await fetch(`https://villadomarapi.azurewebsites.net/api/Products/DeleteProduct?id=${productId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        //se ok o delete ja filtra os novos
        setProducts((prevProducts) => prevProducts?.filter((product) => product.product.id !== productId));
      } else {
        alert('Falaha ao deletar o produto');
      }
    } catch (error) {
      console.error('Ocorrou um erro ao deltar o produto', error);
    }
  };

  // sera q daria pra fazer com que todo edit fosse modularizado, ou to viajando?
  // na vdd o editar seria melhor arbri uma tela nova e la rodar essa funcao 
  // ou ent editar direto na tabela, mas n sei o quao dificil isso é 
const handleEdit = (productId: number) => {
  fetch(
    `https://villadomarapi.azurewebsites.net/api/Products/GetProduct?id=${productId}`
  )
    .then((response) => response.json())
    .then((product) => {
      var name = (document.getElementById("name") as HTMLInputElement);
      var desc = (document.getElementById("description") as HTMLInputElement);

      name.value = product.name;
      desc.value = product.description;
    })
    .catch((error) => {
      console.error(error);
    });
}
const submitEdit = (productId: number) => {
  var name = (document.getElementById("name") as HTMLInputElement);
  var desc = (document.getElementById("description") as HTMLInputElement);

  const data = {
    name: name.value,
    description: desc.value
  };
  fetch(
    `https://villadomarapi.azurewebsites.net/api/Products/EditProduct?id=${productId}`,
    {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    }
  )
    .then((response) => response.json())
    .then(() => {
      name.value = "";
      desc.value = "";
    })
    .catch((error) => {
      console.error(error);
    });
};
  
  // tem q ver se dar pra mudar o tamanho da celular de acoes 
  // ia ser legal botar um botao de lixeira e de um lapis 
  return (
    <Page>
      <Sidebar />
      <div className="w-screen h-screen">
        <StockHeader
          title="Controle de estoque"
          buttonLabel="Adicionar"
          onClick={() => openModal(handleSubmit)}
        />
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <Form fields={fields} onSubmit={handleSubmit} />
        </Modal>
        <Table>
          <TableCaption>Produtos em estoque</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Peso</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Quantidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products === null && (
              <TableRow>
                <TableCell>Carregando...</TableCell>
              </TableRow>
            )}
            {products?.map((product) => (
              <TableRow key={product.product.id}>
                <TableCell>{product.product.name}</TableCell>
                <TableCell>{product.product.description}</TableCell>
                <TableCell>{product.product.value}</TableCell>
                <TableCell>{product.product.weight}</TableCell>
                <TableCell>{product.product.typeProduct}</TableCell>
                <TableCell>{product.product.supplierProduct ? product.product.supplierProduct.name : ""}</TableCell>
                <TableCell>{product.totalAmount}</TableCell>
                <TableCell width={200}>
                  <Button onClick={() => handleDelete(product.product.id)} style={{ marginRight: '10px' }}>Delete</Button>
                  <Button onClick={() => handleEdit()}>Editar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Page>
  );
}
