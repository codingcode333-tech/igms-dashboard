import { Box, Typography } from "@mui/material"
import BarChart, { ExtreemeEndsBarChart } from "./BarChart";

export const RedressalFlagging = () => {
    const reportData = JSON.parse(localStorage.getItem('reportData'));

    const rankings = Object.entries(reportData.redressalEfficacy)
        .filter(([, value]) => value)
        .map(([category, { average_time_days, lower_outlier, total_grievances, upper_outlier, redressal_efficacy_ranking }]) => {
            const chartData = {}

            if (!average_time_days)
                return null

            Object.entries(total_grievances).map(([state, count]) => {
                chartData[state] = {
                    value: count,
                    startPercent: lower_outlier[state] ?? 0,
                    endPercent: upper_outlier[state] ?? 0
                }
            })

            return {
                category,
                average_time_days,
                chartData,
                redressal_efficacy_ranking
            }
        })
        .filter((value) => value)


    const { average_time_days, lower_outlier, total_grievances, upper_outlier, redressal_efficacy_ranking } = Object.values(rankings[0] ?? {})


    return rankings.length > 0 &&
        <Box Box margin="20px auto" >
            <Typography variant="h5"  >
                4. Redressal Flagging:
            </Typography>

            <Typography variant="body2" color="textSecondary" sx={{ marginTop: '20px' }} >
                A mathematical way to flag grievances for a specific topic which are redressed too quickly relative to other GROs too late relative to other GROs having redressed same kind of grievances.
                We have developed this context-sensitive grievance redressal efficiency monitoring mechanism. On an average Ministry of Higher Education Grievances takes {average_time_days} day(s)
            </Typography>

            {
                rankings.slice(0, 1).map(({ category, average_time_days, chartData, redressal_efficacy_ranking }) => {
                    return <>
                        <ExtreemeEndsBarChart chartData={chartData} chartTitle={'Early and Late Redressals'} chartHeight="350px" barWidth="20px" />

                        <div className="new-page"></div>

                        <BarChart chartData={redressal_efficacy_ranking} chartTitle={'Redressal Efficacy Ranking - higher score means to lower redressal efficacy'} color="#ff8282d9"
                            options={{
                                dataLabels: {
                                    enabled: true,
                                    style: {
                                        colors: ['#F5F5F5'],  // Sets the text color on the bars
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                    },
                                }
                            }}
                        />
                    </>
                })
            }
        </Box>

}