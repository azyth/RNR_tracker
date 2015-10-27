require 'test_helper'

class RaceEventsControllerTest < ActionController::TestCase
  setup do
    @race_event = race_events(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:race_events)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create race_event" do
    assert_difference('RaceEvent.count') do
      post :create, race_event: { bib: @race_event.bib, latitude: @race_event.latitude, longitude: @race_event.longitude, raceid: @race_event.raceid, time: @race_event.time }
    end

    assert_redirected_to race_event_path(assigns(:race_event))
  end

  test "should show race_event" do
    get :show, id: @race_event
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @race_event
    assert_response :success
  end

  test "should update race_event" do
    patch :update, id: @race_event, race_event: { bib: @race_event.bib, latitude: @race_event.latitude, longitude: @race_event.longitude, raceid: @race_event.raceid, time: @race_event.time }
    assert_redirected_to race_event_path(assigns(:race_event))
  end

  test "should destroy race_event" do
    assert_difference('RaceEvent.count', -1) do
      delete :destroy, id: @race_event
    end

    assert_redirected_to race_events_path
  end
end
