import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Switch } from 'antd';
import axios from 'axios';
import _ from 'lodash'

const http = axios.create({ headers: {'Content-Type': 'application/json'} });

function calcFilters(filters, inclusive) {
  let _f = _.cloneDeep(filters)
  for (const k in _f) {
    if (!_f[k]){
      delete _f[k];
      continue;
    }
    _f[k] = _f[k][0]
  }
  if (_.isEmpty(_f)) return;
  const o = {inclusive, columns: []};
  for (const k in _f) {
    o.columns.push({
      name: k,
      operator: 'ilike',
      value: _f[k]
    })
  }
  return o
}

const Crud = (props: {
  entityName,
  onTableChange?,
  columns: {
    title: string,
    dataIndex: string
    [x: string]: any
  }[] }) => {
  const [data, setData] = useState([] as any);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [filters, setFilters] = useState({});
  const [inclusive, setInclusive] = useState(false);

    useEffect(() => {
      fetchData();
    }, [filters])

  const fetchData = async () => {
    setLoading(true);
    try {
      const filtering = calcFilters(filters, inclusive)
      const response = await http.post(`/api/${props.entityName}/list`, {filtering});
      setData(response.data.data.items);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await http.delete(`/api/${props.entityName}/${id}`);
      message.success('Record deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const handleEdit = async (record) => {
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await http.put(`/api/${props.entityName}`, values);
      message.success('Record saved successfully');
      form.resetFields();
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error saving record:', error);
    }
  };

  const onTableChange = (pagination, filters, sorters) => {
    setFilters(filters);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Button type="primary" onClick={() => setModalVisible(true)}>
        Create
      </Button>
      <Switch
        checkedChildren={"Inclusive"}
        unCheckedChildren={"Non Inclusive"}
        checked={inclusive}
        onChange={() => setInclusive(old => !old)}
        // defaultChecked={false}
      />
      <Table
      onChange={onTableChange}
      rowKey={'id'}
      columns={[
        ...props.columns,
        // {
        //   title: 'Actions',
        //   dataIndex: 'actions',
        //   key: 'actions',
        //   render: (_, record) => (
        //     <div>
        //       <Button type="link" onClick={() => handleEdit(record)}>
        //         Edit
        //       </Button>
        //       <Button type="link" onClick={() => handleDelete(record.id)}>
        //         Delete
        //       </Button>
        //     </div>
        //   ),
        // },
      ]

      } dataSource={data} loading={loading} />

      <Modal
        open={modalVisible}
        title="Create/Edit Record"
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
      >
        <Form form={form}>
          {/* Define your form fields here */}
          {/* Example: <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter a name' }]}>
                    <Input />
                  </Form.Item> */}
          {/* ... */}
        </Form>
      </Modal>
    </div>
  );
};

export default Crud;

export const filtering = (dataIndex: string, columnName?: string) => ({
  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
          <Input
              placeholder={`Search ${columnName || dataIndex}`}
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={confirm}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
              title="Search"
              type="primary"
              onClick={confirm}
              size="small"
              style={{ width: 90, marginRight: 8 }}
          >
              Search
          </Button>
          <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
              Reset
          </Button>
      </div>
  )
});
