import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config';
import { Link } from 'react-router-dom';

function CommunitiesPage() {
  const { user, getApiKey } = useContext(AuthContext);
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    async function fetchCommunities() {
      try {
        const apiKey = getApiKey();
        const response = await axios.get(
          `${API_BASE_URL}/users/${user.user_id}/communities`,
          { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
        setCommunities(response.data);
      } catch (err) {
        console.error('Error fetching communities:', err);
      }
    }
    if (user) fetchCommunities();
  }, [user, getApiKey]);

  return (
    <div>
      <h2>Your Communities</h2>
      {communities.length > 0 ? (
        <ul>
          {communities.map(community => (
            <li key={community.website_id}>
              <Link to={`/communities/${community.website_id}`}>
                {community.name || `Community ${community.website_id}`}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>You have not joined any communities.</p>
      )}
    </div>
  );
}

export default CommunitiesPage;
