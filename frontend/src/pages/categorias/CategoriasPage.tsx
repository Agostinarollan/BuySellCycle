import { Card, Form, Input, Select, Tabs, Tree } from 'antd';
import type { TreeDataNode } from 'antd';
import { useEffect, useState } from 'react';
import { categoriasNivel1Api, categoriasNivel2Api } from '../../api/categorias.api';
import type {
  CategoriaNivel1Form,
  CategoriaNivel2Form,
} from '../../api/categorias.api';
import CrudPage from '../../components/CrudPage';
import type { CategoriaNivel1, CategoriaNivel2 } from '../../types';

/** Pestaña "Jerarquía": árbol Nivel 1 -> Nivel 2 (GET /categorias-nivel1/arbol). */
function ArbolCategorias() {
  const [arbol, setArbol] = useState<TreeDataNode[]>([]);

  useEffect(() => {
    void categoriasNivel1Api.arbol().then((categorias) =>
      setArbol(
        categorias.map((c1) => ({
          key: `n1-${c1.id}`,
          title: c1.nombre,
          children: (c1.categoriasNivel2 ?? []).map((c2) => ({
            key: `n2-${c2.id}`,
            title: c2.nombre,
          })),
        })),
      ),
    );
  }, []);

  return (
    <Card title="Jerarquía de categorías">
      <Tree treeData={arbol} defaultExpandAll showLine key={arbol.length} />
    </Card>
  );
}

function CategoriasNivel2Tab() {
  const [padres, setPadres] = useState<CategoriaNivel1[]>([]);
  useEffect(() => {
    void categoriasNivel1Api.listar().then(setPadres);
  }, []);

  return (
    <CrudPage<CategoriaNivel2, CategoriaNivel2Form>
      titulo="Categorías nivel 2"
      api={categoriasNivel2Api}
      columnas={[
        { title: 'Nombre', dataIndex: 'nombre' },
        { title: 'Categoría nivel 1 (padre)', render: (_, c) => c.categoriaNivel1?.nombre },
      ]}
      aFormulario={(c) => ({ nombre: c.nombre, categoriaNivel1Id: c.categoriaNivel1Id })}
      campos={
        <>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true, whitespace: true, message: 'Obligatorio' }]}>
            <Input />
          </Form.Item>
          {/* Cambiar el padre = "jerarquizar" la categoría */}
          <Form.Item
            name="categoriaNivel1Id"
            label="Pertenece a (nivel 1)"
            rules={[{ required: true, message: 'Elegí la categoría padre' }]}
          >
            <Select options={padres.map((p) => ({ value: p.id, label: p.nombre }))} />
          </Form.Item>
        </>
      }
    />
  );
}

export default function CategoriasPage() {
  return (
    <Tabs
      // destroyOnHidden: al cambiar de pestaña se vuelve a montar -> recarga datos
      destroyOnHidden
      items={[
        {
          key: 'n1',
          label: 'Nivel 1',
          children: (
            <CrudPage<CategoriaNivel1, CategoriaNivel1Form>
              titulo="Categorías nivel 1"
              api={categoriasNivel1Api}
              columnas={[{ title: 'Nombre', dataIndex: 'nombre' }]}
              campos={
                <Form.Item name="nombre" label="Nombre" rules={[{ required: true, whitespace: true, message: 'Obligatorio' }]}>
                  <Input />
                </Form.Item>
              }
            />
          ),
        },
        { key: 'n2', label: 'Nivel 2', children: <CategoriasNivel2Tab /> },
        { key: 'arbol', label: 'Jerarquía', children: <ArbolCategorias /> },
      ]}
    />
  );
}
