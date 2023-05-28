import { useState } from "react";
import Crud, { filtering } from "../lib/crud";
import 'antd/dist/antd'
import 'antd/lib/style/index'

export default function TestCrud() {
    return <Crud
        entityName={'jobspecs'}
        columns={[
            {title: 'Years of Experience', dataIndex: 'years_of_experience', ...filtering('years_of_experience', 'Years')},
            {title: 'Skill', dataIndex: 'skill_name', ...filtering('skill_name', 'Skill')},
            {title: 'Project name', dataIndex: 'project_name', ...filtering('project_name', 'Project')},
    ]}/>
}