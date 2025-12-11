import pool from '../../../utils/pgConfig.mjs'

export const getStudentHistory = async (accountID, nextSemID) => {
    const response = await pool.query("SELECT * FROM get_history_courses ($1, $2)", [accountID, nextSemID])
    return response.rows.map(row => row.courseid);
}

export const getPrereq = async () => {
    const response = await pool.query("SELECT * FROM get_prereq()");
    const prereqs = {}

    response.rows.forEach(row => {
        if(!prereqs[row.course_id]) prereqs[row.course_id] = [];
        prereqs[row.course_id].push({
            required: row.prereq_course_id ,
            group: row.prereq_group,
            logic: row.group_logic
        })
    })

    return prereqs;
}

export const getCurriculum = async (accountID) => {
    const response = await pool.query("SELECT * FROM get_curriculums($1)", [accountID])

    const curriculum = {}

    response.rows.forEach(row => {
        if(!curriculum[row.group_id]) curriculum[row.group_id] = [];
        curriculum[row.group_id].push({
            parent_group_id: row.parent_group_id,
            group_name: row.group_name,
            selection_rule: row.selection_rule,
            pick_count: row.pick_count,
            course_id: row.course_id
        })
    })

    return curriculum;
}

export const getUpcomingCourse = async (nextSemID) => {
    const response = await pool.query("SELECT * FROM get_upcoming_course($1)", [nextSemID]);
    return response.rows.map(row => row.courseid);
}
