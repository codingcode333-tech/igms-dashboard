import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";
import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext, getUser } from "@/context/UserContext";
import { cacheable, getCache } from "@/helpers/cache";
import { Loader } from "@/pages/dashboard/CategoricalTree";


export function StatisticsCard({ color, icon, title, value, footer, getCount, ministry, from, to, tooltip, updateCount }) {
  const [count, setCount] = useState(value)
  const user = getUser()
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    async function getCountData() {
      // setCount('loading') // To display loader
      // setCount('0')

      let data = (await cacheable(() => getCount(ministry, from, to), `${title}-${ministry}-${from}-${to}-count-data`))

      // Handle different data structures and ensure total_count exists
      let totalCount = 0;
      if (data) {
        if (data.total_count && typeof data.total_count === 'object') {
          // FastAPI structure: { total_count: { total_count: "3929" } }
          totalCount = parseInt(data.total_count.total_count) || 0;
        } else if (typeof data.total_count === 'string' || typeof data.total_count === 'number') {
          // Direct count structure
          totalCount = parseInt(data.total_count) || 0;
        } else if (data.count) {
          // Alternative count field
          totalCount = parseInt(data.count) || 0;
        } else if (typeof data === 'number') {
          // Direct number response
          totalCount = data;
        }
      }

      if (user.username == 'dpg') {
        setTimeout(async () => {
          let additional_data = (await cacheable(() => getCount('DARPG/D', from, to), `${title}-${ministry}-${from}-${to}-additional-count-data`))
          let additionalCount = 0;
          
          if (additional_data) {
            if (additional_data.total_count && typeof additional_data.total_count === 'object') {
              additionalCount = parseInt(additional_data.total_count.total_count) || 0;
            } else if (typeof additional_data.total_count === 'string' || typeof additional_data.total_count === 'number') {
              additionalCount = parseInt(additional_data.total_count) || 0;
            } else if (additional_data.count) {
              additionalCount = parseInt(additional_data.count) || 0;
            }
          }

          totalCount += additionalCount;
          setCount(totalCount.toLocaleString('en-US'))
        }, 3000)
      }

      setCount(totalCount.toLocaleString('en-US'))

      setSearching(false)
    }

    if (searching)
      getCountData()
  }, [searching])

  useEffect(() => {
    if (getCount)
      setSearching(true)
  }, [ministry, from, to])

  useEffect(() => updateCount && updateCount(count, title), [count])

  useEffect(() => setCount(value), [value])

  return (
    <Link to={`/dashboard/grievances/${title.toLowerCase()}/${ministry}/${from}/${to}`}>
      <Card title={tooltip}>
        <CardHeader
          variant="gradient"
          color={color}
          className="absolute -mt-4 grid h-16 w-16 xl:h-12 xl:w-12 place-items-center"
        >
          {icon}
        </CardHeader>
        <CardBody className="p-4 text-right">
          <Typography variant="h4" color="blue-gray">
            {title}

          </Typography>

          <div className="flex justify-end">
            {
              searching
                ? <Loader className="animate-spin" color="#2196f3" />
                : <Typography variant="small" className="font-normal text-blue-gray-600">
                  {count || <span>&nbsp;</span>}
                </Typography>
            }
          </div>
        </CardBody>
        {footer && (
          <CardFooter className="border-t border-blue-gray-50 p-4">
            {footer}
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}

StatisticsCard.defaultProps = {
  color: "blue",
  footer: null,
};

StatisticsCard.propTypes = {
  color: PropTypes.oneOf([
    "white",
    "blue-gray",
    "gray",
    "brown",
    "deep-orange",
    "orange",
    "amber",
    "yellow",
    "lime",
    "light-green",
    "green",
    "teal",
    "cyan",
    "light-blue",
    "blue",
    "indigo",
    "deep-purple",
    "purple",
    "pink",
    "red",
  ]),
  icon: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  getCount: PropTypes.func.isRequired,
  footer: PropTypes.node,
};

StatisticsCard.displayName = "/src/widgets/cards/statistics-card.jsx";

export default StatisticsCard;
